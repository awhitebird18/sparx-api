import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MessagesRepository } from './messages.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { ReactionRepository } from './reactions.repository';
import { User } from 'src/users/entities/user.entity';
import { Reaction } from './entities/reaction.entity';
import { MessageDto } from './dto/message.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ReactionDto } from './dto/reaction.dto';
import { ThreadDto } from './dto/thread.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    private messageRepository: MessagesRepository,
    private reactionRepository: ReactionRepository,
    private channelRepository: ChannelsRepository,
    private events: EventEmitter2,
  ) {}

  private convertToDto(message: Message): MessageDto {
    return plainToInstance(MessageDto, {
      ...message,
      userId: message.user.uuid,
      channelId: message.channel.uuid,
      reactions: this.convertToReactionDtos(message?.reactions),
    });
  }

  private convertToReactionDtos(reactions: Reaction[]): ReactionDto[] {
    const reactionMap: {
      [emojiId: string]: ReactionDto;
    } = {};

    for (const reaction of reactions) {
      const { emojiId, userId } = reaction;
      if (!reactionMap[emojiId]) {
        reactionMap[emojiId] = { emojiId: emojiId, users: [], count: 0 };
      }

      reactionMap[emojiId].users.push(userId);
      reactionMap[emojiId].count++;
    }

    const convertedReactionsArr = Object.values(reactionMap);

    return convertedReactionsArr.map((reaction) =>
      plainToInstance(ReactionDto, reaction),
    );
  }

  async create(
    createMessageDto: CreateMessageDto,
    user: User,
  ): Promise<MessageDto> {
    const channel = await this.channelRepository.findOneOrFail({
      where: {
        uuid: createMessageDto.channelId,
      },
    });

    let parentId = null;
    if (createMessageDto.parentId) {
      const parentMessage = await this.messageRepository.findOneBy({
        uuid: createMessageDto.parentId,
      });
      parentId = parentMessage.id;
    }

    const savedMessage = await this.messageRepository.createMessage({
      ...createMessageDto,
      user,
      channel,
      parentId,
    });

    const messageDto = await this.findPopulatedMessage(savedMessage.uuid);

    this.events.emit('websocket-event', 'newMessage', messageDto);

    return messageDto;
  }

  async findOne(uuid: string): Promise<MessageDto> {
    const message = await this.messageRepository.findOneBy({ uuid });

    const messageDto = this.convertToDto(message);

    return messageDto;
  }

  async findChannelMessages(
    channelId: string,
    page: number,
  ): Promise<MessageDto[]> {
    await this.channelRepository.findOneByOrFail({
      uuid: channelId,
    });

    const messages = await this.messageRepository.findChannelMessages(
      channelId,
      page,
    );

    return messages.map((message: any) => this.convertToDto(message));
  }

  async findThreadMessages(parentMessageId: string): Promise<MessageDto[]> {
    const messages = await this.messageRepository.findThreadMessages(
      parentMessageId,
    );

    const messageDtos = messages.map((message: any) =>
      this.convertToDto(message),
    );

    return messageDtos;
  }

  async findPopulatedMessage(uuid: string): Promise<MessageDto> {
    const message = await this.messageRepository.findMessageByUuid(uuid);

    return this.convertToDto(message);
  }

  async findUserThreads(user: User): Promise<ThreadDto[]> {
    const rootMessages = await this.messageRepository.findUserThreads(user.id);

    const result = [];

    for (const rootMessage of rootMessages) {
      const latestReplies = await this.findThreadMessages(rootMessage.uuid);

      const replyCount = latestReplies.length;

      const userId = rootMessage.user.uuid;
      const channelId = rootMessage.channel.uuid;
      delete rootMessage.user;
      delete rootMessage.channel;

      result.push({
        rootMessage: { ...rootMessage, userId, channelId },
        latestReplies: latestReplies.slice(-2),
        replyCount,
      });
    }

    return plainToInstance(ThreadDto, result);
  }

  async getChannelUnreadMessageCount(
    channelId: string,
    lastRead: Date,
  ): Promise<number> {
    return await this.messageRepository.getChannelUnreadMessageCount(
      channelId,
      lastRead,
    );
  }

  async update(
    uuid: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDto> {
    await this.messageRepository.findOneOrFail({
      where: { uuid },
    });

    await this.messageRepository.updateMessage(uuid, updateMessageDto);

    const serializedMessage = await this.findPopulatedMessage(uuid);

    this.events.emit('websocket-event', 'updateMessage', serializedMessage);

    return serializedMessage;
  }

  async updateMessageReactions(
    messageUuid: string,
    updateReactionDto: UpdateReactionDto,
  ): Promise<MessageDto> {
    const message = await this.messageRepository.findOneOrFail({
      where: { uuid: messageUuid },
      relations: ['reactions'],
    });

    const reaction = message.reactions.find(
      (reaction: Reaction) =>
        reaction.userId === updateReactionDto.userId &&
        reaction.emojiId === updateReactionDto.emojiId,
    );

    if (reaction) {
      const deletedMessage = await this.reactionRepository.removeReaction(
        reaction.uuid,
      );
      if (!deletedMessage) {
        throw new NotFoundException('Unable to find reaction to remove');
      }

      message.reactions = message.reactions.filter(
        (reaction: Reaction) =>
          reaction.userId !== updateReactionDto.userId ||
          reaction.emojiId !== updateReactionDto.emojiId,
      );

      if (!message?.reactions?.length) {
        delete message.reactions;
      }
    } else {
      const reaction = await this.reactionRepository.addReaction({
        ...updateReactionDto,
        message,
      });

      message.reactions.push(reaction);
    }

    const newMessage = await this.messageRepository.save(message);

    const messageToReturn = await this.findPopulatedMessage(newMessage.uuid);

    this.events.emit('websocket-event', 'updateMessage', messageToReturn);

    return messageToReturn;
  }

  async remove(uuid: string): Promise<void> {
    const message = await this.messageRepository.findMessageByUuid(uuid);

    const deletedMessage = await this.messageRepository.softRemove(message);

    if (!deletedMessage)
      throw new NotFoundException('Unable to find message to remove');

    this.events.emit(
      'websocket-event',
      'removeMessage',
      deletedMessage.channel.uuid,
      deletedMessage.uuid,
    );
  }
}

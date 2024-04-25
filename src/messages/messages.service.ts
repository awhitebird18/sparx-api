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

@Injectable()
export class MessagesService {
  constructor(
    private messageRepository: MessagesRepository,
    private reactionRepository: ReactionRepository,
    private channelRepository: ChannelsRepository,
    private events: EventEmitter2,
  ) {}

  private transformReactions(reactions: Reaction[]): ReactionDto[] {
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

    return Object.values(reactionMap);
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

    const message = await this.findPopulatedMessage(savedMessage.uuid);

    this.events.emit('websocket-event', 'newMessage', message);

    return plainToInstance(MessageDto, message);
  }

  async findOne(uuid: string): Promise<MessageDto> {
    const message = await this.messageRepository.findOneBy({ uuid });

    return plainToInstance(MessageDto, message);
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

    const messagesWithGroupedReactions = messages.map((message) => {
      let reactions = [];

      if (message.reactions) {
        reactions = this.transformReactions(message.reactions);
      }

      return {
        uuid: message.uuid,
        content: message.content,
        userId: message.user.uuid,
        channelId: message.channel.uuid,
        isSystem: message.isSystem,
        createdAt: message.createdAt,
        threadCount: message.childMessages?.length,
        reactions,
      };
    });

    return messagesWithGroupedReactions.map((message: any) =>
      plainToInstance(MessageDto, message),
    );
  }

  async findThreadMessages(parentMessageId: string): Promise<MessageDto[]> {
    const messages = await this.messageRepository.findThreadMessages(
      parentMessageId,
    );

    const messagesWithGroupedReactions = messages.map((message) => {
      let reactions = [];

      if (message.reactions) {
        reactions = this.transformReactions(message.reactions);
      }

      return {
        uuid: message.uuid,
        parentId: message.parentMessage.uuid,
        content: message.content,
        userId: message.user.uuid,
        channelId: message.channel.uuid,
        isSystem: message.isSystem,
        createdAt: message.createdAt,
        reactions,
      };
    });

    return messagesWithGroupedReactions.map((message: any) =>
      plainToInstance(MessageDto, message),
    );
  }

  async findPopulatedMessage(uuid: string): Promise<MessageDto> {
    const messageFound = await this.messageRepository.findMessageByUuid(uuid);

    const groupedReactions = this.transformReactions(messageFound.reactions);

    const message = {
      uuid: messageFound.uuid,
      parentId: messageFound.parentMessage?.uuid,
      content: messageFound.content,
      userId: messageFound.user.uuid,
      channelId: messageFound.channel.uuid,
      isSystem: messageFound.isSystem,
      createdAt: messageFound.createdAt,
      updatedAt: messageFound.updatedAt,
      reactions: groupedReactions,
    };

    return plainToInstance(MessageDto, message);
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

  async getUnreadMessageCount(
    channelId: string,
    lastRead: Date,
  ): Promise<number> {
    return await this.messageRepository.getUnreadMessageCount(
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

  async remove(uuid: string): Promise<string> {
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

    return 'Message Removed';
  }
}

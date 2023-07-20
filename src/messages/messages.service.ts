import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UpdateMessageDto } from './dto/UpdateMessage.dto';
import { MessagesRepository } from './messages.repository';
import { UsersRepository } from 'src/users/users.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { plainToInstance } from 'class-transformer';
import { MessageDto } from './dto';
import { Message } from './entities/message.entity';
import { ReactionDto } from './dto/Reaction.dto';
import { ReactionRepository } from './reactions.repository';
import { UpdateReactionDto } from './dto/UpdateReaction.dto';
import { groupBy } from 'lodash';

@Injectable()
export class MessagesService {
  constructor(
    private messageRepository: MessagesRepository,
    private reactionRepository: ReactionRepository,
    private userRepository: UsersRepository,
    private channelRepository: ChannelsRepository,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const user = await this.userRepository.findOneByProperties({
      uuid: createMessageDto.userId,
    });

    const channel = await this.channelRepository.findOneByProperties({
      uuid: createMessageDto.channelId,
    });

    let parentId = null;
    if (createMessageDto.parentId) {
      const parentMessage = await this.messageRepository.findMessageByUuid(
        createMessageDto.parentId,
      );
      parentId = parentMessage.id; // Assuming 'id' is your primary key in Message entity
    }

    const savedMessage = await this.messageRepository.createMessage({
      ...createMessageDto,
      user,
      channel,
      parentId,
    });

    return await this.findPopulatedMessage(savedMessage.uuid);
  }

  findAll() {
    return this.messageRepository.find();
  }

  async findChannelMessages(
    channelId: string,
    page: number,
  ): Promise<MessageDto[]> {
    const messages = await this.messageRepository.findChannelMessages(
      channelId,
      page,
    );

    return messages.map((message: Message) =>
      plainToInstance(MessageDto, message),
    );
  }

  async findPopulatedMessage(uuid: string) {
    const message = await this.messageRepository.findMessageByUuid(uuid);

    const groupedReactions = groupBy(message.reactions, 'emojiId');

    const reactions = Object.entries(groupedReactions).map(
      ([emojiId, reactions]: any) => ({
        uuid: reactions[0].uuid,
        emojiId,
        users: reactions.map((reaction) => reaction.userId),
      }),
    );

    const childMessages = message.childMessages.map((childMessage) => {
      const childGroupedReactions = groupBy(childMessage.reactions, 'emojiId');
      const childReactions = Object.entries(childGroupedReactions).map(
        ([emojiId, reactions]: any) => ({
          uuid: reactions[0].uuid,
          emojiId,
          users: reactions.map((reaction) => reaction.userId),
        }),
      );

      return {
        uuid: childMessage.uuid,
        createdAt: childMessage.createdAt,
        content: childMessage.content,
        userId: childMessage.user.uuid,
        channelId: childMessage.channel.uuid,
        reactions: childReactions,
        childMessages: [], // Assuming childMessages can't have further nested childMessages
      };
    });

    const populatedMessage = {
      uuid: message.uuid,
      createdAt: message.createdAt,
      content: message.content,
      userId: message.user.uuid,
      channelId: message.channel.uuid,
      reactions,
      childMessages,
    };

    console.log(populatedMessage);

    return plainToInstance(MessageDto, populatedMessage);
  }

  findOneByProperties(uuid: string) {
    return this.messageRepository.findOneByProperties({ uuid });
  }

  async update(
    uuid: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDto> {
    const updatedMessage = await this.messageRepository.updateMessage(
      uuid,
      updateMessageDto,
    );

    const message = await this.messageRepository.findMessageByUuid(
      updatedMessage.uuid,
    );

    return await this.findPopulatedMessage(message.uuid);
  }

  async updateMessageReactions(
    uuid: string,
    updateReactionDto: UpdateReactionDto,
  ): Promise<MessageDto> {
    const message = await this.messageRepository.findOneByProperties({ uuid }, [
      'reactions',
    ]);

    if (!message) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    const reaction = message.reactions.find(
      (reaction: ReactionDto) =>
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
        (reaction: ReactionDto) =>
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

    return await this.findPopulatedMessage(newMessage.uuid);
  }

  async remove(uuid: string) {
    return await this.messageRepository.removeMessage(uuid);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { groupBy } from 'lodash';

import { ChatGateway } from 'src/websockets/chat.gateway';
import { MessagesRepository } from './messages.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { ReactionRepository } from './reactions.repository';

import { Message } from './entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import { Reaction } from './entities/reaction.entity';

import { MessageDto } from './dto/message.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private messageRepository: MessagesRepository,
    private reactionRepository: ReactionRepository,
    private channelsRepository: ChannelsRepository,
    private chatGateway: ChatGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto, user: User) {
    // Find channel
    const channel = await this.channelsRepository.findOneOrFail({
      where: {
        uuid: createMessageDto.channelId,
      },
    });

    // Check if message is part of a thread. If so, set parentId
    let parentId = null;
    if (createMessageDto.parentId) {
      const parentMessage = await this.messageRepository.findOneBy({
        uuid: createMessageDto.parentId,
      });
      parentId = parentMessage.id;
    }

    // Create message
    const savedMessage = await this.messageRepository.createMessage({
      ...createMessageDto,
      user,
      channel,
      parentId,
    });

    // Find formatted message
    const message = await this.findPopulatedMessage(savedMessage.uuid);

    // Send over socket
    this.chatGateway.handleSendMessageSocket(message);

    return message;
  }

  findOne(uuid: string) {
    return this.messageRepository.findOneBy({ uuid });
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
      isSystem: message.isSystem,
      reactions,
      childMessages,
    };

    return plainToInstance(MessageDto, populatedMessage);
  }

  async getUnreadMessageCount(channelId: string, lastRead: Date) {
    return await this.messageRepository.getUnreadMessageCount(
      channelId,
      lastRead,
    );
  }

  async update(
    uuid: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDto> {
    // Find the original message
    const message = await this.messageRepository.findOneOrFail({
      where: { uuid },
    });

    // Update the original message with the new data
    Object.assign(message, updateMessageDto);

    // Save the updated message and get the returned value
    const updatedMessage = await this.messageRepository.save(message);

    const serializedMessage = plainToInstance(MessageDto, updatedMessage);

    // Send the updated message to the socket
    this.chatGateway.handleUpdateMessageSocket(serializedMessage);

    // Return the updated message
    return serializedMessage;
  }

  async updateMessageReactions(
    uuid: string,
    updateReactionDto: UpdateReactionDto,
  ): Promise<MessageDto> {
    const message = await this.messageRepository.findOneOrFail({
      where: { uuid },
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

    this.chatGateway.handleSendMessageSocket(messageToReturn);

    return messageToReturn;
  }

  async remove(uuid: string) {
    // Soft remove message
    const message = await this.messageRepository.softRemove({ uuid });

    if (!message)
      throw new NotFoundException('Unable to find message to remove');

    // Send signal over socket to remove message
    this.chatGateway.handleRemoveMessageSocket(message.channelId, message.uuid);

    return 'Message Removed';
  }
}

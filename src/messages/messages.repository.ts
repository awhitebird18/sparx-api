import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Message } from './entities/message.entity';
import { groupBy } from 'lodash';
import { UpdateMessageDto } from './dto';

@Injectable()
export class MessagesRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }
  async createMessage(createMessageDto: Partial<Message>): Promise<Message> {
    const message = this.create(createMessageDto);

    return this.save(message);
  }

  async findAllMessages(): Promise<Message[]> {
    return this.find();
  }

  async findChannelMessages(channelId: string, page: number): Promise<any[]> {
    const take = 30;
    const skip = (page - 1) * take;

    const messages = await this.createQueryBuilder('message')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .innerJoinAndSelect('message.user', 'user')
      .innerJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.childMessages', 'childMessages') // Joined childMessages
      .leftJoinAndSelect('childMessages.user', 'childUser') // Joined user of childMessages
      .leftJoinAndSelect('childMessages.channel', 'childChannel') // J
      .leftJoinAndSelect('childMessages.reactions', 'childReactions') // J
      .where('channel.uuid = :channelId', { channelId })
      .andWhere('message.deletedAt IS NULL')
      .andWhere('message.parentId IS NULL') // Add this line
      .select([
        'message.id',
        'message.content',
        'message.createdAt',
        'message.uuid',
        'user.uuid',
        'channel.uuid',
        'reactions',
        'childMessages',
        'childUser.uuid',
        'childChannel.uuid',
        'childReactions',
      ])
      .take(take)
      .skip(skip)
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const populatedMessages = messages.map((message) => {
      const groupedReactions = groupBy(message.reactions, 'emojiId');

      const reactions = Object.entries(groupedReactions).map(
        ([emojiId, reactions]: any) => ({
          uuid: reactions[0].uuid,
          emojiId,
          users: reactions.map((reaction) => reaction.userId),
        }),
      );

      const childMessages = message.childMessages.map((childMessage) => {
        const childGroupedReactions = groupBy(
          childMessage.reactions,
          'emojiId',
        );
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

      return {
        uuid: message.uuid,
        createdAt: message.createdAt,
        content: message.content,
        userId: message.user.uuid,
        channelId: message.channel.uuid,
        reactions,
        childMessages,
      };
    });

    return populatedMessages;
  }

  async getUnreadMessageCount(
    channelId: string,
    lastRead: Date,
  ): Promise<number> {
    return await this.createQueryBuilder('message')
      .innerJoin('message.channel', 'channel')
      .where('channel.uuid = :channelId', { channelId })
      .andWhere('message.createdAt > :lastRead', { lastRead })
      .getCount();
  }

  async findOneByProperties(
    searchCriteria: FindOptionsWhere<Message>,
    relations?: string[],
  ): Promise<Message> {
    return this.findOne({ where: searchCriteria, relations });
  }

  async findMessageByUuid(uuid: string): Promise<Message | any> {
    const message = await this.createQueryBuilder('message')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .innerJoinAndSelect('message.user', 'user')
      .innerJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.childMessages', 'childMessages') // Joined childMessages
      .leftJoinAndSelect('childMessages.user', 'childUser') // Joined user of childMessages
      .leftJoinAndSelect('childMessages.channel', 'childChannel') // Joined channel of childMessages
      .where('message.uuid = :uuid', { uuid })
      .select([
        'message.id',
        'message.content',
        'message.createdAt',
        'message.uuid',
        'user.uuid',
        'channel.uuid',
        'reactions',
        'childMessages',
        'childUser.uuid',
        'childChannel.uuid',
      ])
      .getOne();

    return message;
  }

  async updateMessage(
    uuid: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const res = await this.update({ uuid }, updateMessageDto);

    if (!res.affected) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    return await this.findOneByProperties({ uuid });
  }

  async removeMessage(uuid: string) {
    const message = await this.findOneByProperties({ uuid });
    if (message) {
      return await this.softRemove(message);
    } else {
      throw new Error(`Message with UUID: ${uuid} not found`);
    }
  }
}

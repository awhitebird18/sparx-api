import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { Message } from './entities/message.entity';
import { UpdateMessageDto } from './dto/update-message.dto';

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

  findChannelMessages(channelId: string, page: number): Promise<Message[]> {
    const take = 30;
    const skip = (page - 1) * take;

    return this.createQueryBuilder('message')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('message.childMessages', 'childMessages')
      .innerJoinAndSelect('message.user', 'user')
      .innerJoinAndSelect('message.channel', 'channel')
      .where('channel.uuid = :channelId', { channelId })
      .andWhere('message.deletedAt IS NULL')
      .andWhere('message.parentId IS NULL')
      .select([
        'message.id',
        'message.uuid',
        'message.content',
        'user.uuid',
        'channel.uuid',
        'message.isSystem',
        'message.createdAt',
        'childMessages',
        'reactions',
      ])
      .take(take)
      .skip(skip)
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  findThreadMessages(messageId: string): Promise<Message[]> {
    return this.createQueryBuilder('message')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('message.parentMessage', 'parentMessage')
      .innerJoinAndSelect('message.user', 'user')
      .innerJoinAndSelect('message.channel', 'channel')
      .where('parentMessage.uuid = :messageId', { messageId })
      .select([
        'message.id',
        'parentMessage.uuid',
        'message.uuid',
        'message.content',
        'user.uuid',
        'channel.uuid',
        'message.isSystem',
        'message.createdAt',
        'reactions',
      ])
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  async findUserThreads(userId: number): Promise<Message[]> {
    return await this.createQueryBuilder('message')
      .leftJoin('message.childMessages', 'childMessage')
      .leftJoin('message.user', 'user')
      .innerJoinAndSelect('message.channel', 'channel')
      .select(['message', 'user', 'channel'])
      .where('childMessage.userId = :userId', { userId })
      .groupBy('message.id, message.uuid, user.uuid, user.id, channel.id')
      .orderBy('message.createdAt', 'DESC')
      .getMany();
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

  findMessageByUuid(uuid: string): Promise<Message> {
    return this.createQueryBuilder('message')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('message.parentMessage', 'parentMessage')
      .innerJoinAndSelect('message.user', 'user')
      .innerJoinAndSelect('message.channel', 'channel')
      .where('message.uuid = :uuid', { uuid })
      .select([
        'message.id',
        'message.uuid',
        'message.content',
        'user.uuid',
        'channel.uuid',
        'message.isSystem',
        'message.createdAt',
        'parentMessage.uuid',
        'reactions',
      ])
      .getOne();
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

  async removeMessage(uuid: string): Promise<Message> {
    const message = await this.findOneByProperties({ uuid });
    if (message) {
      return await this.softRemove(message);
    } else {
      throw new Error(`Message with UUID: ${uuid} not found`);
    }
  }
}

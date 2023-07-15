import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { UpdateMessageDto } from './dto';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }
  async createMessage(createMessageDto: Partial<Message>): Promise<Message> {
    const Message = this.create(createMessageDto);

    return this.save(Message);
  }

  async findAllMessages(): Promise<Message[]> {
    return this.find();
  }

  async findChannelMessages(channelId: string, page: number): Promise<any[]> {
    const take = 30;
    const skip = (page - 1) * take;

    return this.createQueryBuilder('message')
      .innerJoin('message.user', 'user')
      .innerJoin('message.channel', 'channel')
      .where('channel.uuid = :channelId', { channelId })
      .select(['message.id', 'message.content', 'message.createdAt'])
      .addSelect('user.uuid', 'userId')
      .addSelect('channel.uuid', 'channelId')
      .take(take)
      .skip(skip)
      .orderBy('message.createdAt', 'DESC')
      .getRawMany()
      .then((items) =>
        items.map((item) => ({
          id: item.message_id,
          createdAt: item.message_createdAt,
          content: item.message_content,
          userId: item.userId,
          channelId: item.channelId,
        })),
      );
  }

  async findOneByProperties(
    searchCriteria: FindOptionsWhere<Message>,
  ): Promise<Message> {
    return this.findOne({ where: searchCriteria });
  }

  findMessageByUuid(uuid: string): Promise<Message> {
    return this.findOne({ where: { uuid } });
  }

  async updateMessage(
    uuid: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const Message = await this.findMessageByUuid(uuid);

    if (!Message) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    // Update the fields of the Message
    Object.assign(Message, updateMessageDto);

    return this.save(Message);
  }

  async removeMessage(uuid: string) {
    return this.softRemove({ uuid });
  }
}

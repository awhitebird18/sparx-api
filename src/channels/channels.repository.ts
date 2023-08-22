import { DataSource, Repository, FindOptionsWhere, In } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { Channel } from './entities/channel.entity';

import { ChannelType } from './enums/channel-type.enum';
import { CreateChannelDto } from './dto/create-channel.dto';

@Injectable()
export class ChannelsRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }
  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channel = this.create(createChannelDto);

    return this.save(channel);
  }

  async findDirectChannelByUserUuids(userUuids: string[]): Promise<Channel> {
    // Get all DirectChannels where the first user is a member.
    const user1Channels = await this.createQueryBuilder('directChannel')
      .innerJoin('directChannel.channelSubscriptions', 'channelSubscription')
      .innerJoin('channelSubscription.user', 'user', 'user.uuid = :userUuid1', {
        userUuid1: userUuids[0],
      })
      .getMany();
    for (const channel of user1Channels) {
      // Check if the second user is a member of the channel.
      const user2Exists = await this.createQueryBuilder('directChannel')
        .innerJoin('directChannel.channelSubscriptions', 'channelSubscription')
        .innerJoin(
          'channelSubscription.user',
          'user',
          'user.uuid = :userUuid2',
          {
            userUuid2: userUuids[1],
          },
        )
        .where('directChannel.id = :channelId', { channelId: channel.id })
        .getOne();
      if (user2Exists) {
        return channel;
      }
    }
    return undefined;
  }

  async findUserChannels(userId: number): Promise<Channel[]> {
    return await this.createQueryBuilder('channel')
      .leftJoin('channel.channelSubscriptions', 'channelSubscription')
      .innerJoin('channelSubscription.user', 'user') // Join the user relationship in ChannelSubscription
      .select('channel')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async findWorkspaceChannelsWithUserCounts(
    page: number,
    pageSize = 15,
  ): Promise<any> {
    return await this.createQueryBuilder('channel')
      .leftJoin('channel.channelSubscriptions', 'channelSubscription')
      .select('channel') // This selects all fields of the `channel` entity
      .addSelect('COUNT(channelSubscription.uuid)', 'usercount')
      .where('channel.type = :type', { type: ChannelType.CHANNEL })
      .andWhere('channel.isPrivate = :isPrivate', { isPrivate: false })
      .groupBy('channel.id')
      .orderBy('channel.name', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawAndEntities();
  }

  async findChannelsByIds(channelIds: string[]): Promise<Channel[]> {
    return this.find({
      where: {
        id: In(channelIds),
      },
    });
  }

  async findOneByProperties(
    searchCriteria: FindOptionsWhere<Channel>,
  ): Promise<Channel> {
    return this.findOne({ where: searchCriteria });
  }

  findByUuid(uuid: string): Promise<Channel> {
    return this.findOne({ where: { uuid } });
  }

  async removeChannel(uuid: string) {
    return this.softRemove({ uuid });
  }
}

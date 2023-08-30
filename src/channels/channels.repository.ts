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
  createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channel = this.create(createChannelDto);
    return this.save(channel);
  }

  async findDirectChannelByUserUuids(userUuids: string[]): Promise<Channel> {
    // Get all DirectChannels where the first user is a member.
    const currentUsersChannels = await this.createQueryBuilder('channel')
      .innerJoin('channel.channelSubscriptions', 'channelSubscription')
      .innerJoin(
        'channelSubscription.user',
        'user',
        'user.uuid = :currentUserId',
        {
          currentUserId: userUuids[0],
        },
      )
      .where('channel.type = :channelType', { channelType: ChannelType.DIRECT })
      .getMany();

    for (const channel of currentUsersChannels) {
      // Check if the second user is a member of the channel.
      const user2Exists = await this.createQueryBuilder('channel')
        .innerJoin('channel.channelSubscriptions', 'channelSubscription')
        .innerJoin(
          'channelSubscription.user',
          'user',
          'user.uuid = :userUuid2',
          {
            userUuid2: userUuids[1],
          },
        )
        .where('channel.id = :channelId', { channelId: channel.id })
        .getOne();
      if (user2Exists) {
        return channel;
      }
    }
    return undefined;
  }

  findUserChannels(userId: number): Promise<Channel[]> {
    return this.createQueryBuilder('channel')
      .leftJoin('channel.channelSubscriptions', 'channelSubscription')
      .innerJoin('channelSubscription.user', 'user')
      .select('channel')
      .where('user.id = :userId', { userId })
      .andWhere('channelSubscription.isSubscribed')
      .getMany();
  }

  findChannelUserIds(channelId: string): Promise<string[]> {
    return this.createQueryBuilder('channel')
      .leftJoin('channel.channelSubscriptions', 'subscription')
      .leftJoin('subscription.user', 'user')
      .select('user.uuid')
      .where('channel.uuid = :channelId', { channelId })
      .getRawMany()
      .then((results) => results.map((result) => result.user_uuid));
  }

  findChannelUsers(channelId: string): Promise<{ id: string; name: string }[]> {
    return this.createQueryBuilder('channel')
      .leftJoin('channel.channelSubscriptions', 'subscription')
      .leftJoin('subscription.user', 'user')
      .select(['channel', 'user'])
      .where('channel.uuid = :channelId', { channelId })
      .andWhere('channel.type = :channelType', {
        channelType: ChannelType.DIRECT,
      })
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          id: result.user_id,
          name: `${result.user_firstName} ${result.user_lastName}`,
        })),
      );
  }

  findWorkspaceChannelsWithUserCounts(
    page: number,
    pageSize = 15,
  ): Promise<any> {
    return this.createQueryBuilder('channel')
      .leftJoinAndSelect(
        'channel.channelSubscriptions',
        'channelSubscription',
        'channelSubscription.isSubscribed = TRUE',
      ) // Adding condition to join
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

  findChannelsByIds(channelIds: string[]): Promise<Channel[]> {
    return this.find({
      where: {
        id: In(channelIds),
      },
    });
  }

  findOneByProperties(
    searchCriteria: FindOptionsWhere<Channel>,
  ): Promise<Channel> {
    return this.findOne({ where: searchCriteria });
  }

  findByUuid(uuid: string): Promise<Channel> {
    return this.findOne({ where: { uuid } });
  }

  removeChannelByUuid(uuid: string): Promise<Channel> {
    return this.softRemove({ uuid });
  }
}

import {
  DataSource,
  Repository,
  FindOptionsWhere,
  In,
  UpdateResult,
} from 'typeorm';
import { Injectable } from '@nestjs/common';

import { Channel } from './entities/channel.entity';

import { ChannelType } from './enums/channel-type.enum';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Public } from 'src/common/decorators/is-public';

@Injectable()
export class ChannelsRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }
  createChannel(
    createChannelDto: CreateChannelDto,
    workspace: Workspace,
  ): Promise<Channel> {
    const channel = this.create({ ...createChannelDto, workspace });
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

  async findUserChannels(userId: number): Promise<any[]> {
    const channels = await this.createQueryBuilder('channel')
      .leftJoinAndSelect(
        'channel.channelSubscriptions',
        'channelSubscription',
        'channelSubscription.isSubscribed = true',
      )
      .innerJoin('channelSubscription.user', 'user', 'user.id = :userId', {
        userId,
      })
      .select([
        'channel.uuid',
        'channel.name',
        'channel.topic',
        'channel.description',
        'channel.isPrivate',
        'channel.x',
        'channel.y',
        'channel.icon',
        'channel.type',
      ])
      .addSelect('channelSubscription.status')
      .getMany();

    return channels.map((channel) => {
      // Assuming there is always one subscription per channel for the user
      const subscription = channel.channelSubscriptions[0];
      if (subscription) {
        // Add status to the channel object
        return { ...channel, status: subscription.status };
      }
      return channel;
    });
  }

  async findWorkspaceChannels(
    userId: number,
    workspaceId: string,
  ): Promise<any[]> {
    const channels = await this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.workspace', 'workspace')
      .leftJoinAndSelect('channel.channelSubscriptions', 'channelSubscription')
      .leftJoinAndSelect('channelSubscription.user', 'user')
      .where('workspace.uuid = :workspaceId', { workspaceId })
      .getMany();

    return channels.map((channel) => {
      // Filter subscriptions for the current user
      const userSubscription = channel.channelSubscriptions.find(
        (subscription) => subscription.user.id === userId,
      );

      return {
        ...channel,
        isSubscribed: !!userSubscription?.isSubscribed,
        subscriptionDetails: userSubscription,
      };
    });
  }

  async findWorkspaceChannel(userId: number, channelId: string): Promise<any> {
    const channel = await this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.workspace', 'workspace')
      .leftJoinAndSelect('channel.channelSubscriptions', 'channelSubscription')
      .leftJoinAndSelect('channelSubscription.user', 'user')
      .where('channel.uuid = :channelId', { channelId })
      .getOne();

    // Filter subscriptions for the current user
    const userSubscription = channel.channelSubscriptions.find(
      (subscription) => subscription.user.id === userId,
    );

    return {
      ...channel,
      isSubscribed: !!userSubscription?.isSubscribed,
      subscriptionDetails: userSubscription,
    };
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

  findChannelUsers(channelId: string): Promise<any[]> {
    return (
      this.createQueryBuilder('channel')
        .leftJoinAndSelect('channel.channelSubscriptions', 'subscription')
        .leftJoinAndSelect('subscription.user', 'user')
        // .select(['channel', 'user'])
        .where('channel.uuid = :channelId', { channelId })
        .getRawMany()
        .then((results) => {
          const resultingArr = results.map((result) => ({
            userId: result.user_uuid,
            isAdmin: result.subscription_isAdmin,
            status: result.subscription_status,
          }));

          return resultingArr;
        })
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

  findChannelUserCounts(workspaceId: string): Promise<any> {
    return this.createQueryBuilder('channel')
      .leftJoinAndSelect(
        'channel.channelSubscriptions',
        'channelSubscription',
        'channelSubscription.isSubscribed = TRUE',
      ) // Adding condition to join
      .leftJoin('channel.workspace', 'workspace')
      .select('channel') // This selects all fields of the `channel` entity
      .addSelect('COUNT(channelSubscription.uuid)', 'usercount')
      .where('channel.type = :type', { type: ChannelType.CHANNEL })
      .andWhere('channel.isPrivate = :isPrivate', { isPrivate: false })
      .andWhere('workspace.uuid = :workspaceId', { workspaceId })
      .groupBy('channel.id')
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

  removeChannelByUuid(uuid: string): Promise<UpdateResult> {
    return this.softDelete({ uuid });
  }
}

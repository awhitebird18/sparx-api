import {
  DataSource,
  Repository,
  FindOptionsWhere,
  In,
  UpdateResult,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { UpdateChannelCoordinatesDto } from './dto/update-channel-coordinates';

@Injectable()
export class ChannelsRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }
  createChannel(
    createChannelDto: CreateChannelDto,
    workspace: Workspace,
  ): Promise<Channel> {
    try {
      const channel = this.create({
        ...createChannelDto,
        workspace,
      });
      return this.save(channel);
    } catch (err) {
      console.error(err);
    }
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
      const subscription = channel.channelSubscriptions[0];
      if (subscription) {
        return { ...channel, status: subscription.status };
      }
      return channel;
    });
  }

  async findWorkspaceChannels(
    userId: number,
    workspaceId: string,
  ): Promise<Channel[]> {
    const channels = await this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.workspace', 'workspace')
      .leftJoinAndSelect('channel.childChannels', 'childChannels')
      .leftJoinAndSelect('channel.parentChannel', 'parentChannel')
      .leftJoinAndSelect('channel.channelSubscriptions', 'channelSubscription')
      .leftJoinAndSelect('channelSubscription.user', 'user')
      .where('workspace.uuid = :workspaceId', { workspaceId })
      .getMany();

    return channels;

    // return channels.map((channel) => {
    //   const userSubscription = channel.channelSubscriptions.find(
    //     (subscription) => subscription.user.id === userId,
    //   );

    //   return {
    //     ...channel,
    //     isSubscribed: !!userSubscription?.isSubscribed,
    //     subscriptionDetails: userSubscription,
    //   };
    // });
  }

  async updateManyChannels(
    channels: UpdateChannelCoordinatesDto[],
  ): Promise<Channel[]> {
    const uuids = channels.map((channel) => channel.uuid);

    // Execute all updates in parallel
    await Promise.all(
      channels.map((channelDto) =>
        this.createQueryBuilder()
          .update(Channel)
          .set({
            x: channelDto.x,
            y: channelDto.y,
          })
          .where('uuid = :uuid', { uuid: channelDto.uuid })
          .execute(),
      ),
    );

    // Fetch all updated channels in a single query using the IN clause
    return this.find({
      where: {
        uuid: In(uuids),
      },
      relations: ['parentChannel', 'childChannels'],
    });
  }

  async findWorkspaceChannel(userId: number, channelId: string): Promise<any> {
    const channel = await this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.workspace', 'workspace')
      .leftJoinAndSelect('channel.channelSubscriptions', 'channelSubscription')
      .leftJoinAndSelect('channelSubscription.user', 'user')
      .where('channel.uuid = :channelId', { channelId })
      .getOne();

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
    return this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.channelSubscriptions', 'subscription')
      .leftJoinAndSelect('subscription.user', 'user')
      .where('channel.uuid = :channelId', { channelId })
      .getRawMany()
      .then((results) => {
        const resultingArr = results.map((result) => ({
          userId: result.user_uuid,
          isAdmin: result.subscription_isAdmin,
          status: result.subscription_status,
        }));

        return resultingArr;
      });
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
      )
      .select('channel')
      .addSelect('COUNT(channelSubscription.uuid)', 'usercount')
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
      )
      .leftJoin('channel.workspace', 'workspace')
      .select('channel')
      .addSelect('COUNT(channelSubscription.uuid)', 'usercount')
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

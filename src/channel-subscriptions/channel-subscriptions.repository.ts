import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ChannelSubscription } from './entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';

@Injectable()
export class ChannelSubscriptionsRepository extends Repository<ChannelSubscription> {
  constructor(private dataSource: DataSource) {
    super(ChannelSubscription, dataSource.createEntityManager());
  }

  findOneByProperties(
    searchFields: FindOptionsWhere<ChannelSubscription>,
    relations?: string[],
  ): Promise<ChannelSubscription> {
    return this.findOne({
      where: searchFields,
      relations,
    });
  }

  findByUserUuid(userUuid: string): Promise<ChannelSubscription[]> {
    return this.createQueryBuilder('channelSubscription')
      .leftJoinAndSelect('channelSubscription.section', 'section')
      .innerJoinAndSelect('channelSubscription.channel', 'channel')
      .leftJoinAndSelect('channelSubscription.user', 'user')
      .select(['channelSubscription', 'section.uuid', 'channel'])
      .where('user.uuid = :uuid', { uuid: userUuid })
      .andWhere('channelSubscription.isSubscribed = true')
      .getMany();
  }

  findSubscribedChannelsByUserId(
    userId: number,
  ): Promise<ChannelSubscription[]> {
    return this.find({
      where: { user: { id: userId }, isSubscribed: true },
      relations: ['channel', 'section'],
    });
  }

  updateUserRole(user: User, isAdmin: boolean, channel: Channel) {
    return this.update(
      { user: { id: user.id }, channel: { id: channel.id } },
      { isAdmin },
    );
  }

  getChannelUsersCount(channelId: number): Promise<number> {
    return this.createQueryBuilder('channelSubscription')
      .where('channelSubscription.channelId = :channelId', { channelId })
      .andWhere('channelSubscription.isSubscribed = :isSubscribed', {
        isSubscribed: true,
      })
      .getCount();
  }

  findChannelSubscriptionsWithLastRead(
    userUuid: string,
  ): Promise<ChannelSubscription[]> {
    return this.createQueryBuilder('channelSubscription')
      .leftJoinAndSelect('channelSubscription.channel', 'channel')
      .innerJoin('channelSubscription.user', 'user')
      .where('user.uuid = :userUuid', { userUuid })
      .andWhere('channelSubscription.isSubscribed = :isSubscribed', {
        isSubscribed: true,
      })
      .select([
        'channelSubscription.uuid',
        'channelSubscription.lastRead',
        'channel.uuid',
      ])
      .getMany();
  }
}

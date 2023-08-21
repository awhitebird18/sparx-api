import {
  DataSource,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ChannelSubscription } from './entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChannelSubscriptionsRepository extends Repository<ChannelSubscription> {
  constructor(private dataSource: DataSource) {
    super(ChannelSubscription, dataSource.createEntityManager());
  }

  async findOneByProperties(
    searchFields: FindOptionsWhere<ChannelSubscription>,
    relations?: string[],
  ) {
    return await this.findOne({
      where: searchFields,
      relations,
    });
  }

  async findByProperties(userId: string) {
    return await this.createQueryBuilder('channelSubscription')
      .leftJoinAndSelect('channelSubscription.section', 'section')
      .leftJoinAndSelect('channelSubscription.channel', 'channel')
      .leftJoinAndSelect('channelSubscription.user', 'user')
      .select(['channelSubscription', 'section.uuid', 'channel'])
      .where('user.uuid = :uuid', { uuid: userId })
      .andWhere('channelSubscription.isSubscribed = true')
      .getMany();
  }

  async findSubscribedChannelsByUserId(
    userUuid: string,
  ): Promise<ChannelSubscription[]> {
    return await this.find({
      where: { user: { uuid: userUuid }, isSubscribed: true },
      relations: ['channel', 'section'],
    });
  }

  async findUsersByChannelId(channelUuid: string): Promise<User[]> {
    const channelSubscriptions = await this.createQueryBuilder(
      'channelSubscription',
    )
      .innerJoinAndSelect('channelSubscription.user', 'user')
      .innerJoin('channelSubscription.channel', 'channel')
      .where('channel.uuid = :channelUuid', { channelUuid })
      .andWhere('channelSubscription.isSubscribed = :isSubscribed', {
        isSubscribed: true,
      })
      .getMany();

    return channelSubscriptions.map(
      (channelSubscription) => channelSubscription.user,
    );
  }

  async updateUserChannel(
    uuid: string,
    channelSubscription: Partial<ChannelSubscription>,
  ): Promise<UpdateResult> {
    return await this.update({ uuid }, channelSubscription);
  }

  async getChannelUsersCount(channelId: number) {
    return await this.createQueryBuilder('channelSubscription')
      .where('channelSubscription.channelId = :channelId', { channelId })
      .andWhere('channelSubscription.isSubscribed = :isSubscribed', {
        isSubscribed: true,
      })
      .getCount();
  }

  async findChannelSubscriptionsWithLastRead(
    userUuid: string,
  ): Promise<ChannelSubscription[]> {
    return await this.createQueryBuilder('channelSubscription')
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

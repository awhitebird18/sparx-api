import {
  DataSource,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelSubscription } from './entity/channel-subscription.entity';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { UsersRepository } from 'src/users/users.repository';
import { SectionsRepository } from 'src/sections/sections.repository';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChannelSubscriptionsRepository extends Repository<ChannelSubscription> {
  constructor(
    private dataSource: DataSource,
    private channelRepository: ChannelsRepository,
    private usersRepository: UsersRepository,
    private sectionsRepository: SectionsRepository,
  ) {
    super(ChannelSubscription, dataSource.createEntityManager());
  }

  async createAndSave(
    userUuid: string,
    channelUuid: string,
    sectionUuid: string,
  ): Promise<ChannelSubscription> {
    const user = await this.usersRepository.findOneByProperties({
      uuid: userUuid,
    });
    if (!user) {
      throw new NotFoundException(`User with UUID ${userUuid} not found`);
    }
    const channel = await this.channelRepository.findOneByProperties({
      uuid: channelUuid,
    });
    if (!channel) {
      throw new NotFoundException(`Channel with UUID ${channelUuid} not found`);
    }
    const section = await this.sectionsRepository.findOneByProperties({
      uuid: sectionUuid,
    });
    if (!section) {
      throw new NotFoundException(`Section with UUID ${sectionUuid} not found`);
    }
    const directChannelMember = this.create({ user, channel, section });
    return this.save(directChannelMember);
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

  async findByProperties(
    searchFields: FindOptionsWhere<ChannelSubscription>,
    relations?: string[],
  ) {
    return await this.find({
      where: searchFields,
      relations,
    });
  }

  async findSubscribedChannelsByUserId(
    userUuid: string,
  ): Promise<ChannelSubscription[]> {
    return await this.find({
      where: { user: { uuid: userUuid }, isSubscribed: true },
      relations: ['channel', 'section'],
    });
  }

  async findUsersByChannelId(channelId: string): Promise<User[]> {
    const channelSubscriptions = await this.createQueryBuilder(
      'channelSubscription',
    )
      .innerJoinAndSelect('channelSubscription.user', 'user')
      .innerJoin('channelSubscription.channel', 'channel')
      .where('channel.uuid = :channelId', { channelId })
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

  async createUserChannel(userChannelDto: {
    userId: string;
    channelId: string;
  }): Promise<ChannelSubscription> {
    // Fetch the user and channel
    const user = await this.usersRepository.findOneByProperties({
      uuid: userChannelDto.userId,
    });
    const channel = await this.channelRepository.findOneByProperties({
      uuid: userChannelDto.channelId,
    });
    const section = await this.sectionsRepository.findDefaultSection(
      channel.type,
      user.uuid,
    );

    // Check if user and channel exist
    if (!user || !channel || !section) {
      throw new Error('User, channel, or section does not exist');
    }

    // Create a new ChannelSubscription
    const channelSubscription = new ChannelSubscription();

    channelSubscription.user = user;
    channelSubscription.channel = channel;
    channelSubscription.section = section;

    return this.save(channelSubscription);
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

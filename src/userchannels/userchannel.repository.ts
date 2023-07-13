import {
  DataSource,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserChannel } from './entity/userchannel.entity';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { UsersRepository } from 'src/users/users.repository';
import { SectionsRepository } from 'src/sections/sections.repository';

@Injectable()
export class UserChannelsRepository extends Repository<UserChannel> {
  constructor(
    private dataSource: DataSource,
    private channelRepository: ChannelsRepository,
    private userRepository: UsersRepository,
    private sectionRepository: SectionsRepository,
  ) {
    super(UserChannel, dataSource.createEntityManager());
  }

  async findOneByProperties(
    searchFields: FindOptionsWhere<UserChannel>,
    relations?: string[],
  ) {
    return await this.findOne({
      where: searchFields,
      relations,
    });
  }

  async updateUserChannel(
    uuid: string,
    userChannel: Partial<UserChannel>,
  ): Promise<UpdateResult> {
    return await this.update({ uuid }, userChannel);
  }

  async createUserChannel(userChannelDto: {
    userId: string;
    channelId: string;
  }): Promise<UserChannel> {
    // Fetch the user and channel
    const user = await this.userRepository.findOneByProperties({
      uuid: userChannelDto.userId,
    });
    const channel = await this.channelRepository.findOneByProperties({
      uuid: userChannelDto.channelId,
    });
    const section = await this.sectionRepository.findOneByProperties({
      type: channel.type,
    });

    // Check if user and channel exist
    if (!user || !channel || !section) {
      throw new Error('User, channel, or section does not exist');
    }

    // Create a new UserChannel
    const userChannel = new UserChannel();

    userChannel.user = user;
    userChannel.channel = channel;
    userChannel.section = section;

    return this.save(userChannel);
  }

  async findSubscribedChannelsByUserId(
    userUuid: string,
  ): Promise<UserChannel[]> {
    return await this.createQueryBuilder('userChannel')
      .innerJoinAndSelect('userChannel.channel', 'channel')
      .innerJoinAndSelect('userChannel.section', 'section')
      .innerJoin('userChannel.user', 'user')
      .where('user.uuid = :userUuid', { userUuid })
      .andWhere('userChannel.isSubscribed = :isSubscribed', {
        isSubscribed: true,
      })
      .getMany();
  }
}

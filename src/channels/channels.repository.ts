import { DataSource, Repository, FindOptionsWhere, In } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto';
import { Injectable } from '@nestjs/common';
import { ChannelType } from './enums/channel-type.enum';

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

  async findWorkspaceChannels(page: number, pageSize = 15): Promise<Channel[]> {
    return await this.createQueryBuilder('channel')
      .where({ type: ChannelType.CHANNEL })
      .andWhere({ isPrivate: false })
      .orderBy('channel.name', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
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

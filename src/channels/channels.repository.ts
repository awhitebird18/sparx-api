import { DataSource, Repository, FindOptionsWhere, In } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto, UpdateChannelDto } from './dto';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Section } from 'src/sections/entities/section.entity';
import { ChannelType } from './enums/channelType.enum';

@Injectable()
export class ChannelsRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }
  async createChannel(
    createChannelDto: CreateChannelDto,
    section: Section,
  ): Promise<Channel> {
    const channel = this.create(createChannelDto);

    channel.section = section;
    return this.save(channel);
  }

  async findDirectChannelByUserUuids(userUuids: string[]): Promise<Channel> {
    // Get all DirectChannels where the first user is a member.
    const user1Channels = await this.createQueryBuilder('directChannel')
      .innerJoin('directChannel.userChannels', 'userChannel')
      .innerJoin('userChannel.user', 'user', 'user.uuid = :userUuid1', {
        userUuid1: userUuids[0],
      })
      .getMany();
    for (const channel of user1Channels) {
      // Check if the second user is a member of the channel.
      const user2Exists = await this.createQueryBuilder('directChannel')
        .innerJoin('directChannel.userChannels', 'userChannel')
        .innerJoin('userChannel.user', 'user', 'user.uuid = :userUuid2', {
          userUuid2: userUuids[1],
        })
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

  async findDirectMessages(): Promise<Channel[]> {
    return this.find({ where: { type: ChannelType.DIRECT } });
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

  findChannelByUuid(uuid: string): Promise<Channel> {
    return this.findOne({ where: { uuid } });
  }

  async updateChannel(
    uuid: string,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    const channel = await this.findChannelByUuid(uuid);

    if (!channel) {
      throw new NotFoundException(`Channel with UUID ${uuid} not found`);
    }

    // Update the fields of the channel
    Object.assign(channel, updateChannelDto);

    return this.save(channel);
  }

  async removeChannel(uuid: string) {
    return this.softRemove({ uuid });
  }
}

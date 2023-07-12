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

  async findSubscribedChannels(): Promise<Channel[]> {
    return this.find();
  }

  async findChannels(type: ChannelType): Promise<Channel[]> {
    return this.find({ where: { type: type } });
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

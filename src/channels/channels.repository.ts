import { DataSource, Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto, UpdateChannelDto } from './dto';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class ChannelsRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }
  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channel = this.create(createChannelDto);
    return this.save(channel);
  }

  async findSubscribedChannels(): Promise<Channel[]> {
    return this.find();
  }

  findChannel(uuid: string): Promise<Channel> {
    return this.findOne({ where: { uuid } });
  }

  async updateChannel(
    uuid: string,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    const channel = await this.findChannel(uuid);

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

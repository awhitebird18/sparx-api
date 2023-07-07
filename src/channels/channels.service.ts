import { Injectable } from '@nestjs/common';
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ChannelsService {
  constructor(private channelsRepository: ChannelsRepository) {}

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    return this.channelsRepository.createChannel(createChannelDto);
  }

  async findSubscribedChannels() {
    const channels = await this.channelsRepository.findSubscribedChannels();
    return plainToInstance(ChannelDto, channels);
  }

  async findOne(uuid: string) {
    const channel = await this.channelsRepository.findChannel(uuid);

    return plainToInstance(ChannelDto, channel);
  }

  async updateChannel(uuid: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelsRepository.updateChannel(
      uuid,
      updateChannelDto,
    );

    return plainToInstance(ChannelDto, channel);
  }

  async removeChannel(uuid: string): Promise<boolean> {
    const channel = await this.channelsRepository.findChannel(uuid);

    if (!channel) {
      return false;
    }

    await this.channelsRepository.softRemove(channel);
    return true;
  }
}

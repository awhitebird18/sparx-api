import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { plainToInstance } from 'class-transformer';
import { SectionsRepository } from 'src/sections/sections.repository';
import { ChannelGateway } from 'src/websockets/channel.gateway';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private sectionRepository: SectionsRepository,
    private channelGateway: ChannelGateway,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto) {
    // Perform checks
    const section = await this.sectionRepository.findOneByProperties({
      uuid: '5d0103a5-51d8-4ce7-8038-db4b45b429a7',
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const existingChannel = await this.channelsRepository.findOneByProperties({
      name: createChannelDto.name,
    });

    if (existingChannel) {
      throw new ConflictException('A channel with this name already exists.');
    }

    // Create database entry
    await this.channelsRepository.createChannel(createChannelDto, section);

    // Send new channel over socket
    this.channelGateway.sendChannelUpdate();
  }

  async findSubscribedChannels() {
    const channels = await this.channelsRepository.findSubscribedChannels();
    return plainToInstance(ChannelDto, channels);
  }

  async findOne(uuid: string) {
    const channel = await this.channelsRepository.findChannelByUuid(uuid);

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
    const channel = await this.channelsRepository.findChannelByUuid(uuid);

    if (!channel) {
      return false;
    }

    await this.channelsRepository.softRemove(channel);
    return true;
  }
}

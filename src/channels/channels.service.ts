import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';
import { plainToInstance } from 'class-transformer';
import { SectionsRepository } from 'src/sections/sections.repository';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private sectionRepository: SectionsRepository,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const section = await this.sectionRepository.findSection(
      '6780ff5c-44a3-43c9-9be3-a6bf1d16e8e9',
    );

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const existingChannel = await this.channelsRepository.findOneByProperties({
      name: createChannelDto.name,
    });

    if (existingChannel) {
      throw new ConflictException('A channel with this name already exists.');
    }

    return this.channelsRepository.createChannel(createChannelDto, section);
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

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
import { ChannelType } from './enums/channelType.enum';
import { UserchannelsService } from 'src/userchannels/userchannels.service';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private sectionRepository: SectionsRepository,
    private channelGateway: ChannelGateway,
    private userChannelService: UserchannelsService,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto, userId: string) {
    // Perform checks
    const section = await this.sectionRepository.findDefaultSection(
      createChannelDto.type,
    );

    if (!section) {
      throw new NotFoundException('Default section not found');
    }

    const existingChannel = await this.channelsRepository.findOneByProperties({
      name: createChannelDto.name,
    });

    if (existingChannel) {
      throw new ConflictException('A channel with this name already exists.');
    }

    // Create database entry
    const newChannel = await this.channelsRepository.createChannel(
      createChannelDto,
      section,
    );

    const userChannel = await this.userChannelService.joinChannel(
      userId,
      newChannel.uuid,
    );

    console.log('returning this', userChannel);

    // Send new channel over socket
    // this.channelGateway.sendChannelUpdate();

    return userChannel;
  }

  async findChannels(type: ChannelType) {
    return this.channelsRepository.findChannels(type);
  }

  async findWorkspaceChannels() {
    const channels = await this.channelsRepository.findWorkspaceChannels();
    return plainToInstance(ChannelDto, channels);
  }

  async findOne(searchProperties: any) {
    const channel = await this.channelsRepository.findOneByProperties(
      searchProperties,
    );

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

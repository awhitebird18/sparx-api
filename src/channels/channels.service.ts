import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { plainToInstance } from 'class-transformer';
import { SectionsRepository } from 'src/sections/sections.repository';
import { ChannelType } from './enums/channelType.enum';
import { UserchannelsService } from 'src/userchannels/userchannels.service';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { saveBase64Image } from 'src/utils/saveBase64Image';
import { ChannelGateway } from 'src/websockets/channel.gateway';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private sectionRepository: SectionsRepository,
    private userChannelService: UserchannelsService,
    private channelGateway: ChannelGateway,
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

  async updateChannel(id: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelsRepository.findChannelByUuid(id);

    if (updateChannelDto.icon) {
      const imageId = uuid();

      const folderPath = `/static/`;

      const imagePath = path.join(folderPath, imageId);

      saveBase64Image(updateChannelDto.icon, imagePath);
      channel.icon = imagePath;
      delete updateChannelDto.icon;
    }

    Object.assign(channel, updateChannelDto);

    const updatedChannel = await this.channelsRepository.save(channel);

    this.channelGateway.handleUpdateChannelSocket(updatedChannel);

    return updatedChannel;
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

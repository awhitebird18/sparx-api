import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { ChannelsRepository } from './channels.repository';
import { ChannelGateway } from 'src/websockets/channel.gateway';
import { FilesService } from 'src/files/files.service';
import { Channel } from './entities/channel.entity';

import { ChannelDto } from './dto/channel.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private filesService: FilesService,
    private channelGateway: ChannelGateway,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    // Check if channel name already exists. If so, throw error.
    const existingChannel = await this.channelsRepository.findOne({
      where: {
        name: createChannelDto.name,
      },
    });
    if (existingChannel)
      throw new ConflictException('A channel with this name already exists.');

    // Create database entry
    const newChannel = await this.channelsRepository.createChannel(
      createChannelDto,
    );

    return newChannel;
  }

  findUserChannels(userId: number): Promise<Channel[]> {
    return this.channelsRepository.findUserChannels(userId);
  }

  findDirectChannelByUserUuids(memberIds: string[]): Promise<Channel> {
    return this.channelsRepository.findDirectChannelByUserUuids(memberIds);
  }

  async findWorkspaceChannels(
    page: number,
    pageSize = 15,
  ): Promise<{ channel: ChannelDto; userCount: number }[]> {
    const result =
      await this.channelsRepository.findWorkspaceChannelsWithUserCounts(
        page,
        pageSize,
      );

    const channelsWithUserCount = result.entities.map(
      (channel: Channel, index: number) => ({
        channel,
        userCount: result.raw[index].usercount,
      }),
    );

    return channelsWithUserCount;
  }

  async updateChannel(
    id: string,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    // Check if channel exists
    const channel = await this.channelsRepository.findByUuid(id);

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Handle image storage
    if (updateChannelDto.icon) {
      const imagePath = await this.filesService.saveImage(
        updateChannelDto.icon,
      );
      channel.icon = imagePath;
      delete updateChannelDto.icon;
    }

    // Update channel
    Object.assign(channel, updateChannelDto);
    const updatedChannel = await this.channelsRepository.save(channel);

    // Send updated channel by socket
    this.channelGateway.handleUpdateChannelSocket(updatedChannel);

    return updatedChannel;
  }

  async removeChannel(uuid: string): Promise<void> {
    // Remove channel
    const removedChannel = await this.channelsRepository.removeChannelByUuid(
      uuid,
    );

    if (!removedChannel)
      throw new NotFoundException(`Unable to find user with id ${uuid}`);

    // Send websocket
    this.channelGateway.handleRemoveChannelSocket(removedChannel.uuid);
  }
}

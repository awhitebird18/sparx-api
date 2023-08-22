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

  async createChannel(createChannelDto: CreateChannelDto) {
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

  async findUserChannels(userId: number) {
    return await this.channelsRepository.findUserChannels(userId);
  }

  async findDirectChannelByUserUuids(memberIds: string[]) {
    return await this.channelsRepository.findDirectChannelByUserUuids(
      memberIds,
    );
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

  async updateChannel(id: string, updateChannelDto: UpdateChannelDto) {
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

  async removeChannel(uuid: string): Promise<boolean> {
    const channel = await this.channelsRepository.findByUuid(uuid);

    if (!channel) {
      return false;
    }

    await this.channelsRepository.softRemove(channel);
    return true;
  }
}

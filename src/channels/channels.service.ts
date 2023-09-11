import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';

import { ChannelDto } from './dto/channel.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelUserCount } from './dto/channel-user-count.dto';
import { ChannelType } from './enums/channel-type.enum';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private cloudinaryService: CloudinaryService,
    private events: EventEmitter2,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    // Check if channel name already exists. If so, throw error.
    const existingChannel = await this.channelsRepository.findOne({
      where: {
        name: createChannelDto.name,
      },
    });

    if (existingChannel && existingChannel.type === ChannelType.CHANNEL)
      throw new ConflictException('A channel with this name already exists.');

    // Create database entry
    const newChannel = await this.channelsRepository.createChannel(
      createChannelDto,
    );

    return newChannel;
  }

  async findUserChannels(currentUserId: number): Promise<Channel[]> {
    const channels = await this.channelsRepository.findUserChannels(
      currentUserId,
    );

    for (let i = 0; i < channels.length; i++) {
      if (channels[i].type === ChannelType.DIRECT) {
        channels[i].name = await this.findDirectChannelName(
          channels[i].uuid,
          currentUserId,
        );
      }
    }

    return channels;
  }

  findChannelUserIds(channelId: string): Promise<string[]> {
    return this.channelsRepository.findChannelUserIds(channelId);
  }

  findDirectChannelByUserUuids(memberIds: string[]): Promise<Channel> {
    return this.channelsRepository.findDirectChannelByUserUuids(memberIds);
  }

  async findWorkspaceChannels(
    page: number,
    pageSize = 15,
  ): Promise<{
    channels: ChannelDto[];
    channelUserCounts: ChannelUserCount[];
  }> {
    const result =
      await this.channelsRepository.findWorkspaceChannelsWithUserCounts(
        page,
        pageSize,
      );

    const channelUserCounts = result.raw.map((channelUserCount: any) => ({
      channelUuid: channelUserCount.channel_uuid,
      userCount: channelUserCount.usercount || 0,
    }));

    const channels = result.entities;

    return { channels, channelUserCounts };
  }

  async findDirectChannelName(
    channelUuid: string,
    currentUserId: number,
  ): Promise<string> {
    const channelUsers = await this.channelsRepository.findChannelUsers(
      channelUuid,
    );

    const otherUser = channelUsers.find((u: any) => u.id !== currentUserId);

    return otherUser.name;
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
      const uploadedImageUrl = await this.cloudinaryService.upload(
        updateChannelDto.icon,
        id,
      );
      channel.icon = uploadedImageUrl;
      delete updateChannelDto.icon;
    }

    // Update channel
    Object.assign(channel, updateChannelDto);
    const updatedChannel = await this.channelsRepository.save(channel);

    // Send updated channel by socket
    this.events.emit('websocket-event', 'updateChannel', updatedChannel);

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
    // this.channelGateway.handleRemoveChannelSocket(removedChannel.uuid);
  }
}

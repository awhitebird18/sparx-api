import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';

import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelUserCount } from './dto/channel-user-count.dto';
import { ChannelType } from './enums/channel-type.enum';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/users/entities/user.entity';

import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { LogActivity } from 'src/activity/utils/logActivity';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private workspaceRepository: WorkspacesRepository,
    private cloudinaryService: CloudinaryService,
    private events: EventEmitter2,
  ) {}

  async createChannel(
    createChannelDto: CreateChannelDto,
    workspaceUuid: string,
    user?: User,
  ): Promise<Channel> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceUuid },
    });

    // Check if channel name already exists. If so, throw error.
    const existingChannel = await this.channelsRepository.findOne({
      where: {
        name: createChannelDto.name,
        workspace: { id: workspace.id },
      },
    });

    // if (existingChannel && existingChannel.type === ChannelType.CHANNEL)
    //   throw new ConflictException('A channel with this name already exists.');

    // Create database entry
    const newChannel = await this.channelsRepository.createChannel(
      createChannelDto,
      workspace,
    );

    if (user) {
      this.events.emit(
        'log.created',
        new LogActivity(
          user.uuid,
          workspace.uuid,
          'Node Completed',
          `created a new module for ${newChannel.name}`,
        ),
      );
    }

    return newChannel;
  }

  async findUserChannels(user: User): Promise<any[]> {
    const channels = await this.channelsRepository.findUserChannels(user.id);

    for (let i = 0; i < channels.length; i++) {
      if (channels[i].type === ChannelType.DIRECT) {
        channels[i].name = await this.findDirectChannelName(
          channels[i].uuid,
          user.uuid,
        );
      }
    }

    return channels;
  }

  findWorkspaceChannels(userId: number, workspaceId: string): Promise<any[]> {
    return this.channelsRepository.findWorkspaceChannels(userId, workspaceId);
  }

  findChannelUserIds(channelId: string): Promise<string[]> {
    return this.channelsRepository.findChannelUserIds(channelId);
  }

  findDirectChannelByUserUuids(memberIds: string[]): Promise<Channel> {
    return this.channelsRepository.findDirectChannelByUserUuids(memberIds);
  }

  // async findWorkspaceChannels(
  //   page: number,
  //   pageSize = 15,
  // ): Promise<{
  //   channels: ChannelDto[];
  //   channelUserCounts: ChannelUserCount[];
  // }> {
  //   const result =
  //     await this.channelsRepository.findWorkspaceChannelsWithUserCounts(
  //       page,
  //       pageSize,
  //     );

  //   const channelUserCounts = result.raw.map((channelUserCount: any) => ({
  //     channelUuid: channelUserCount.channel_uuid,
  //     userCount: channelUserCount.usercount || 0,
  //   }));

  //   const channels = result.entities;

  //   return { channels, channelUserCounts };
  // }

  async findChannelUserCounts(
    workspaceId: string,
  ): Promise<ChannelUserCount[]> {
    const result = await this.channelsRepository.findChannelUserCounts(
      workspaceId,
    );

    const channelUserCounts = result.raw.map((channelUserCount: any) => ({
      channelUuid: channelUserCount.channel_uuid,
      userCount: channelUserCount.usercount || 0,
    }));

    return channelUserCounts;
  }

  async findDirectChannelName(
    channelUuid: string,
    currentUserId: string,
  ): Promise<string> {
    const channelUsers = await this.channelsRepository.findChannelUsers(
      channelUuid,
    );

    const otherUser = channelUsers.find((u: any) => u.uuid !== currentUserId);

    return otherUser.name;
  }

  async findChannelUsers(channelUuid: string): Promise<any> {
    const channelUsers = await this.channelsRepository.findChannelUsers(
      channelUuid,
    );

    return channelUsers;

    // return channelUsers.filter((u: any) => u.uuid !== currentUserId);
  }

  async updateChannel(
    id: string,
    updateChannelDto: UpdateChannelDto,
    workspaceId: string,
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
    this.events.emit(
      'websocket-event',
      'updateChannel',
      updatedChannel,
      workspaceId,
    );

    return updatedChannel;
  }

  async removeChannel(uuid: string, workspaceId: string): Promise<void> {
    const channelFound = await this.channelsRepository.findOneOrFail({
      where: { uuid },
      relations: [
        'messages',
        'channelSubscriptions',
        'flashcards',
        'childConnectors',
        'parentConnectors',
      ],
    });

    // Remove channel
    const removedChannel = await this.channelsRepository.softRemove(
      channelFound,
    );

    if (!removedChannel)
      throw new NotFoundException(`Unable to find user with id ${uuid}`);

    // Send websocket
    this.events.emit('websocket-event', 'removeChannel', uuid, workspaceId);
  }

  async removeChannelsByWorkspace(workspaceId: string) {
    const workspaceChannels = await this.channelsRepository.find({
      where: { workspace: { uuid: workspaceId } },
    });

    await this.channelsRepository.softRemove(workspaceChannels);
  }
}

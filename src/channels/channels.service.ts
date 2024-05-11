import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelUserCount } from './dto/channel-user-count.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/users/entities/user.entity';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { LogActivity } from 'src/activity/utils/logActivity';
import { SectionsRepository } from 'src/sections/sections.repository';
import { AssistantService } from 'src/assistant/assistant.service';
import { ChannelDto } from './dto/channel.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateChannelCoordinatesDto } from './dto/update-channel-coordinates';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private workspaceRepository: WorkspacesRepository,
    private cloudinaryService: CloudinaryService,
    private sectionsRepository: SectionsRepository,
    private events: EventEmitter2,
    private assistantService: AssistantService,
  ) {}

  convertToDto(channel: Channel): ChannelDto {
    const parentChannelId = channel?.parentChannel?.uuid;
    const childChannelIds = channel.childChannels.length
      ? channel.childChannels.map((childChannel) => childChannel?.uuid)
      : [];

    return plainToInstance(ChannelDto, {
      ...channel,
      parentChannelId,
      childChannelIds,
    });
  }

  async createChannel(
    createChannelDto: CreateChannelDto,
    workspaceUuid: string,
    user?: User,
  ): Promise<Channel> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceUuid },
    });

    if (createChannelDto.parentChannelId) {
      const parentChannel = await this.channelsRepository.findByUuid(
        createChannelDto.parentChannelId,
      );

      createChannelDto.parentChannel = parentChannel;
    }

    const newChannel = await this.channelsRepository.createChannel(
      createChannelDto,
      workspace,
    );

    const channelWithRelations = await this.channelsRepository.findOne({
      where: { uuid: newChannel.uuid },
      relations: ['parentChannel', 'childChannels'],
    });

    if (user) {
      this.events.emit(
        'log.created',
        new LogActivity(
          user.uuid,
          workspace.uuid,
          'Node Completed',
          `created a new module for ${channelWithRelations.name}`,
        ),
      );
    }

    return channelWithRelations;
  }

  async generateRoadmap({
    topic,
    workspaceId,
    user,
  }: {
    topic: string;
    workspaceId: string;
    user: User;
  }): Promise<ChannelDto[]> {
    try {
      const subTopicYCoords = [
        0, 0, 120, 120, -120, -120, 240, 240, -240, -240,
      ];

      const nodemapTopics = await this.assistantService.generateRoadmapTopics(
        topic,
      );

      const clearNodemap = async (workspaceId: string) => {
        await this.removeChannelsByWorkspace(workspaceId);
      };

      const createNodemap = async (
        data: { topic: string; subtopics: string[] }[],
      ) => {
        for (let i = 0; i < data.length; i++) {
          const entry = data[i];

          // Secondary topics
          const subtopics = entry.subtopics;
          const channelsPromises = [];

          for (let j = 0; j < subtopics.length; j++) {
            const subTopic = subtopics[j];

            const isEven = j % 2 === 0;

            const topic = {
              name: subTopic,
              x: 4000 + (isEven ? -1 : 1) * 480,
              y: 500 * (i + 2) + subTopicYCoords[j],
            };
            channelsPromises.push(this.createChannel(topic, workspaceId));
          }

          const childChannels = await Promise.all(channelsPromises);
          // Main topic
          const mainTopic = {
            name: entry.topic,
            x: 4000,
            y: 500 * (i + 2),
            workspaceId,
            isDefault: i === 0,
            childChannels,
          };

          await this.createChannel(mainTopic, workspaceId);
        }

        return this.findWorkspaceChannels(user.id, workspaceId);
      };

      await clearNodemap(workspaceId);
      await createNodemap(nodemapTopics);

      const channelDtos = await this.findWorkspaceChannels(
        user.id,
        workspaceId,
      );

      return channelDtos;
    } catch (err) {
      console.error(err);
    }
  }

  async findWorkspaceChannels(
    userId: number,
    workspaceId: string,
  ): Promise<ChannelDto[]> {
    const channels = await this.channelsRepository.findWorkspaceChannels(
      userId,
      workspaceId,
    );

    const channelDtos = channels.map((channel) => this.convertToDto(channel));

    return channelDtos;
  }

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

  async findChannelUsers(channelUuid: string): Promise<any> {
    const channelUsers = await this.channelsRepository.findChannelUsers(
      channelUuid,
    );

    return channelUsers;
  }

  async updateChannel(
    id: string,
    updateChannelDto: UpdateChannelDto,
    workspaceId: string,
  ): Promise<ChannelDto> {
    // Check if channel exists
    const channel = await this.channelsRepository.findByUuid(id);

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (updateChannelDto.icon) {
      const uploadedImageUrl = await this.cloudinaryService.upload(
        updateChannelDto.icon,
        id,
      );
      channel.icon = uploadedImageUrl;
      delete updateChannelDto.icon;
    }

    Object.assign(channel, updateChannelDto);
    const updatedChannel = await this.channelsRepository.save(channel);

    const channelToReturn = await this.channelsRepository.findOne({
      where: { uuid: updatedChannel.uuid },
      relations: ['parentChannel', 'childChannels'],
    });

    const channelDto = this.convertToDto(channelToReturn);

    this.events.emit(
      'websocket-event',
      'updateChannel',
      channelDto,
      workspaceId,
    );

    return channelDto;
  }

  async moveChannel(
    channelId: string,
    updateChannelDto: UpdateChannelDto,
    parentChannelId: string,
  ): Promise<ChannelDto[]> {
    // Check if channel exists
    const channelPromise = this.channelsRepository.findByUuid(channelId);
    const parentChannelPromise =
      this.channelsRepository.findByUuid(parentChannelId);

    const [channel, parentChannel] = await Promise.all([
      channelPromise,
      parentChannelPromise,
    ]);

    if (!channel || !parentChannel) {
      throw new NotFoundException('Channel not found');
    }

    // Update channel values
    Object.assign(channel, updateChannelDto);
    channel.parentChannel = parentChannel;

    const updatedChannel = await this.channelsRepository.save(channel);

    const channelToReturn = await this.channelsRepository.findOne({
      where: { uuid: updatedChannel.uuid },
      relations: ['parentChannel', 'childChannels'],
    });
    const parentChannelToReturn = await this.channelsRepository.findOne({
      where: { uuid: parentChannel.uuid },
      relations: ['parentChannel', 'childChannels'],
    });

    const channelDto = this.convertToDto(channelToReturn);
    const parentChannelDto = this.convertToDto(parentChannelToReturn);

    return [channelDto, parentChannelDto];
  }

  async updateManyChannels(
    channels: UpdateChannelCoordinatesDto[],
  ): Promise<ChannelDto[]> {
    const updatedChannels = await this.channelsRepository.updateManyChannels(
      channels,
    );

    return updatedChannels.map((channel) => this.convertToDto(channel));
  }

  async removeChannel(uuid: string): Promise<void> {
    const channelFound = await this.channelsRepository.findOneOrFail({
      where: { uuid },
      relations: [
        'messages',
        'channelSubscriptions',
        'flashcards',
        'workspace',
      ],
    });

    const removedChannel = await this.channelsRepository.softRemove(
      channelFound,
    );

    if (!removedChannel)
      throw new NotFoundException(`Unable to find user with id ${uuid}`);

    const workspaceId = channelFound.workspace.uuid;
    this.events.emit('websocket-event', 'removeChannel', uuid, workspaceId);
  }

  async removeChannelsByWorkspace(workspaceId: string) {
    const workspaceChannels = await this.channelsRepository.find({
      where: { workspace: { uuid: workspaceId } },
      relations: ['childChannels', 'parentChannel'],
    });

    await this.channelsRepository.softRemove(workspaceChannels);
  }

  async sendUserChannelSocket(
    userId: string,
    channel: Channel,
    sectionUuid: string,
  ): Promise<void> {
    this.events.emit(
      'websocket-event',
      'joinChannel',
      channel,
      sectionUuid,
      userId,
    );
  }
}

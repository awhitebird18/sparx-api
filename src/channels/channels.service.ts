import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { plainToInstance } from 'class-transformer';
import { SectionsRepository } from 'src/sections/sections.repository';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';
import { ChannelGateway } from 'src/websockets/channel.gateway';
import { SectionType } from 'src/sections/enums';
import { ChannelType } from './enums/channel-type.enum';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private sectionsRepository: SectionsRepository,
    private ChannelSubscriptionservice: ChannelSubscriptionsService,
    private channelGateway: ChannelGateway,
    private filesService: FilesService,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto, userId: string) {
    // Check if channel name already exists. If so, throw error.
    const existingChannel = await this.channelsRepository.findOneByProperties({
      name: createChannelDto.name,
    });

    if (existingChannel) {
      throw new ConflictException('A channel with this name already exists.');
    }

    // Create database entry
    const newChannel = await this.channelsRepository.createChannel(
      createChannelDto,
    );

    // Add current user to channel
    const channelSubscription =
      await this.ChannelSubscriptionservice.joinChannel(
        userId,
        newChannel.uuid,
      );

    return channelSubscription;
  }

  async createDirectChannel(memberIds: string[]) {
    const channel = await this.channelsRepository.findDirectChannelByUserUuids(
      memberIds,
    );
    if (channel) {
      throw new ConflictException(
        `A direct channel with members [${memberIds.join(
          ', ',
        )}] already exists.`,
      );
    }

    const createdChannel = this.channelsRepository.create({
      type: ChannelType.DIRECT,
    });
    // Create channel
    const newChannel = await this.channelsRepository.save(createdChannel);
    // Add members to the channel
    const memberPromises = memberIds.map(async (memberId) => {
      const section = await this.sectionsRepository.findDefaultSection(
        SectionType.DIRECT,
        memberId,
      );
      return this.ChannelSubscriptionservice.createAndSave(
        memberId,
        newChannel.uuid,
        section.uuid,
      );
    });
    await Promise.all(memberPromises);
    return newChannel;
  }

  async findDirectChannelByUserUuids(memberIds: string[]) {
    return await this.channelsRepository.findDirectChannelByUserUuids(
      memberIds,
    );
  }

  async findWorkspaceChannels(page: number, pageSize: number) {
    const channels = await this.channelsRepository.findWorkspaceChannels(
      page,
      pageSize,
    );

    const channelsWithUserCount = await Promise.all(
      channels.map(async (channel) => {
        const userCount =
          await this.ChannelSubscriptionservice.getUserChannelCount(channel.id);

        return {
          ...channel,
          userCount,
        };
      }),
    );

    return channelsWithUserCount;
  }

  async findOne(searchProperties: any) {
    const channel = await this.channelsRepository.findOneByProperties(
      searchProperties,
    );

    return plainToInstance(ChannelDto, channel);
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

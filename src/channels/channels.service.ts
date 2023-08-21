import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';
import { ChannelGateway } from 'src/websockets/channel.gateway';
import { ChannelType } from './enums/channel-type.enum';
import { FilesService } from 'src/files/files.service';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private channelSubscriptionService: ChannelSubscriptionsService,
    private filesService: FilesService,
    private channelGateway: ChannelGateway,
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
      await this.channelSubscriptionService.joinChannel(
        userId,
        newChannel.uuid,
        ChannelType.CHANNEL,
      );

    return channelSubscription;
  }

  async findUserChannels(userUuid: string) {
    return await this.channelsRepository.findUserChannels(userUuid);
  }

  async createDirectChannel(memberIds: string[]) {
    // Check if direct channel with both members already exists
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

    // Create new direct message channel
    const newChannel = await this.channelsRepository.save({
      type: ChannelType.DIRECT,
    });

    // Add members to the channel
    const memberPromises = memberIds.map(async (memberId) => {
      return this.channelSubscriptionService.joinChannel(
        memberId,
        newChannel.uuid,
        ChannelType.DIRECT,
      );
    });
    await Promise.all(memberPromises);

    // Todo: may need to send over socket to all members who are part of the channel

    return newChannel;
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

  async findOne(searchProperties: any) {
    return await this.channelsRepository.findOneBy(searchProperties);
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

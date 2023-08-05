import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { plainToInstance } from 'class-transformer';
import { SectionsRepository } from 'src/sections/sections.repository';
import { UserchannelsService } from 'src/userchannels/userchannels.service';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { saveBase64Image } from 'src/utils/saveBase64Image';
import { ChannelGateway } from 'src/websockets/channel.gateway';
import { SectionType } from 'src/sections/enums';
import { ChannelType } from './enums/channelType.enum';

@Injectable()
export class ChannelsService {
  constructor(
    private channelsRepository: ChannelsRepository,
    private sectionsRepository: SectionsRepository,
    private userChannelService: UserchannelsService,
    private channelGateway: ChannelGateway,
  ) {}

  async createChannel(createChannelDto: CreateChannelDto, userId: string) {
    // Perform checks
    const section = await this.sectionsRepository.findDefaultSection(
      createChannelDto.type,
      userId,
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
      return this.userChannelService.createAndSave(
        memberId,
        newChannel.uuid,
        section.uuid,
      );
    });
    await Promise.all(memberPromises);
    return newChannel;
  }

  async findDirectChannelByUserUuids(createDirectChannelDto: any) {
    return await this.channelsRepository.findDirectChannelByUserUuids(
      createDirectChannelDto.memberIds,
    );
  }

  async findWorkspaceChannels(page: number, pageSize: number) {
    const channels = await this.channelsRepository.findWorkspaceChannels(
      page,
      pageSize,
    );

    const channelsWithUserCount = await Promise.all(
      channels.map(async (channel) => {
        const userCount = await this.userChannelService.getUserChannelCount(
          channel.id,
        );

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

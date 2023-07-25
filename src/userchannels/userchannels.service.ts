import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserChannelsRepository } from './userchannel.repository';
import { UserChannelDto } from './dto/UserChannel.dto';
import { plainToClass } from 'class-transformer';
import { ChannelDto } from 'src/channels/dto';
import { SectionsRepository } from 'src/sections/sections.repository';
import { UserChannel } from './entity/userchannel.entity';
import { ChannelGateway } from 'src/websockets/channel.gateway';

@Injectable()
export class UserchannelsService {
  constructor(
    private userChannelsRepository: UserChannelsRepository,
    private sectionsRepository: SectionsRepository,
    private channelGateway: ChannelGateway,
  ) {}

  async joinChannel(userUuid: string, channelUuid: string) {
    const userChannel = await this.userChannelsRepository.findOneByProperties({
      user: { uuid: userUuid },
      channel: { uuid: channelUuid },
    });

    if (userChannel?.isSubscribed) {
      throw new HttpException(
        'User is already subscribed to the channel',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userChannelsRepository.createUserChannel({
      userId: userUuid,
      channelId: channelUuid,
    });

    const userChannelToReturn = await this.findUserChannel(
      userUuid,
      channelUuid,
    );

    this.channelGateway.handleJoinChannelSocket(userChannelToReturn);

    return userChannelToReturn;
  }

  async leaveChannel(userUuid: string, channelUuid: string) {
    const userChannel = await this.userChannelsRepository.findOneByProperties(
      {
        user: { uuid: userUuid },
        channel: { uuid: channelUuid },
        isSubscribed: true,
      },
      ['channel'],
    );

    if (!userChannel) {
      throw new NotFoundException('User-Channel link not found');
    }

    const section = await this.sectionsRepository.findDefaultSection(
      userChannel.channel.type,
      userUuid,
    );

    const userChannelToReturn =
      await this.userChannelsRepository.updateUserChannel(userChannel.uuid, {
        isSubscribed: false,
        section,
      });

    this.channelGateway.handleLeaveChannelSocket(channelUuid);

    return userChannelToReturn;
  }

  async findUserChannel(
    userUuid: string,
    channelUuid: string,
  ): Promise<UserChannelDto> {
    const userChannel = await this.userChannelsRepository.findOneByProperties(
      {
        user: { uuid: userUuid },
        channel: { uuid: channelUuid },
      },
      ['channel', 'section'],
    );

    if (!userChannel.section) {
      const defaultSection = await this.sectionsRepository.findDefaultSection(
        userChannel.channel.type,
        userUuid,
      );

      userChannel.section = defaultSection;
    }

    if (!userChannel) {
      throw new HttpException('UserChannel not found', HttpStatus.BAD_REQUEST);
    }

    const res = {
      ...plainToClass(UserChannelDto, userChannel),
      ...plainToClass(ChannelDto, userChannel.channel),
      sectionId: userChannel.section.uuid,
    };

    delete res.section;
    delete res.channel;

    return res;
  }

  async updateUserChannel(
    userUuid: string,
    channelUuid: string,
    updatedFields: Partial<UserChannel>,
  ) {
    const userChannel = await this.userChannelsRepository.findOneByProperties({
      user: { uuid: userUuid },
      channel: { uuid: channelUuid },
    });

    if (userChannel?.isSubscribed) {
      throw new HttpException(
        'User is already subscribed to the channel',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userChannelsRepository.updateUserChannel(
      userChannel.uuid,
      updatedFields,
    );

    return await this.findUserChannel(userUuid, channelUuid);
  }

  async updateChannelSection(
    userUuid: string,
    channelUuid: string,
    sectionUuid: string,
  ) {
    const userChannel = await this.userChannelsRepository.findOneByProperties({
      user: { uuid: userUuid },
      channel: { uuid: channelUuid },
    });

    const section = await this.sectionsRepository.findOneByProperties({
      uuid: sectionUuid,
    });

    console.log(section, userChannel);

    if (!userChannel || !section) {
      throw new HttpException(
        'No userchannel or section found',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userChannelsRepository.updateUserChannel(userChannel.uuid, {
      section,
    });

    return await this.findUserChannel(userUuid, channelUuid);
  }

  async getUserSubscribedChannels(userId: string): Promise<UserChannelDto[]> {
    const userChannels =
      await this.userChannelsRepository.findSubscribedChannelsByUserId(userId);

    if (!userChannels) {
      throw new NotFoundException('No user channels found');
    }

    const channels = await Promise.all(
      userChannels.map(async (userChannel) => {
        const users = await this.userChannelsRepository.findUsersByChannelId(
          userChannel.channel.uuid,
        );
        const res = {
          ...plainToClass(UserChannelDto, userChannel),
          ...plainToClass(ChannelDto, userChannel.channel),
          sectionId: userChannel.section.uuid,
          channelId: userChannel.channel.uuid,
          users,
        };

        delete res.section;
        delete res.channel;

        return res;
      }),
    );

    return channels;
  }
}

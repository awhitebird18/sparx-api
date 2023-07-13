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

@Injectable()
export class UserchannelsService {
  constructor(
    private userChannelsRepository: UserChannelsRepository,
    private sectionsRepository: SectionsRepository,
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

    return this.findUserChannel(userUuid, channelUuid);
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

    console.log(userChannel);

    if (!userChannel) {
      throw new NotFoundException('User-Channel link not found');
    }

    const section = await this.sectionsRepository.findDefaultSection(
      userChannel.channel.type,
    );

    await this.userChannelsRepository.updateUserChannel(userChannel.uuid, {
      isSubscribed: false,
      section,
    });
    const updatedChannel = await this.findUserChannel(userUuid, channelUuid);

    console.log(updatedChannel);

    return updatedChannel;
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

  async getUserSubscribedChannels(userId: string): Promise<UserChannelDto[]> {
    const userChannels =
      await this.userChannelsRepository.findSubscribedChannelsByUserId(userId);

    if (!userChannels) {
      throw new NotFoundException('No user channels found');
    }

    const channels = userChannels.map((userChannel) => {
      const res = {
        ...plainToClass(UserChannelDto, userChannel),
        ...plainToClass(ChannelDto, userChannel.channel),
        sectionId: userChannel.section.uuid,
        channelId: userChannel.channel.uuid,
      };

      delete res.section;
      delete res.channel;

      return res;
    });

    return channels;
  }
}

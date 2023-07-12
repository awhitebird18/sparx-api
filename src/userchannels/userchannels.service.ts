import { Injectable, NotFoundException } from '@nestjs/common';
import { UserChannelsRepository } from './userchannel.repository';
import { UserChannel } from './entity/userchannel.entity';
import { UserChannelDto } from './dto/UserChannel.dto';
import { SectionsService } from 'src/sections/sections.service';

@Injectable()
export class UserchannelsService {
  constructor(
    private userChannelsRepository: UserChannelsRepository,
    private sectionsService: SectionsService,
  ) {}

  async joinChannel(userUuid: string, channelUuid: string) {
    let userChannel = await this.userChannelsRepository.findOneByProperties(
      {
        user: { uuid: userUuid },
        channel: { uuid: channelUuid },
      },
      ['channel'],
    );

    if (userChannel) {
      userChannel.isSubscribed = true;
      return this.userChannelsRepository.updateUserChannel(userChannel);
    }

    const section = await this.sectionsService.findDefaultSection(
      userChannel.channel.type,
    );

    userChannel = await this.userChannelsRepository.createUserChannel(
      {
        userId: userUuid,
        channelId: channelUuid,
      },
      section,
    );

    return userChannel;
  }

  async leaveChannel(userUuid: string, channelUuid: string) {
    const userChannel = await this.userChannelsRepository.findOneByProperties({
      user: { uuid: userUuid },
      channel: { uuid: channelUuid },
    });

    if (!userChannel) {
      throw new NotFoundException('User-Channel link not found');
    }

    userChannel.isSubscribed = false;
    return this.userChannelsRepository.updateUserChannel(userChannel);
  }

  async findUserChannel(
    userUuid: string,
    channelUuid: string,
  ): Promise<UserChannel> {
    const userChannel = await this.userChannelsRepository.findOneByProperties({
      user: { uuid: userUuid },
      channel: { uuid: channelUuid },
    });

    if (!userChannel) {
      throw new NotFoundException('UserChannel not found');
    }

    return userChannel;
  }

  async getUserSubscribedChannels(userId: string): Promise<UserChannelDto[]> {
    const userChannels =
      await this.userChannelsRepository.findSubscribedChannelsByUserId(userId);

    if (!userChannels) {
      throw new NotFoundException('User not found');
    }

    const channels = userChannels.map((userChannel) => ({
      ...userChannel,
      ...userChannel.channel,
    }));

    return channels;
  }
}

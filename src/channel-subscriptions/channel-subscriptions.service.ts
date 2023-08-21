import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ChannelGateway } from 'src/websockets/channel.gateway';

import { ChannelSubscription } from './entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';

import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { ChannelDto } from 'src/channels/dto';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';

import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';

import { ChannelsService } from 'src/channels/channels.service';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from 'src/messages/messages.service';
import { SectionsService } from 'src/sections/sections.service';

@Injectable()
export class ChannelSubscriptionsService {
  constructor(
    private channelSubscriptionsRepository: ChannelSubscriptionsRepository,
    private channelsService: ChannelsService,
    private sectionsService: SectionsService,
    private messagesService: MessagesService,
    private usersService: UsersService,
    private channelGateway: ChannelGateway,
  ) {}

  async joinChannel(
    userUuid: string,
    channelUuid: string,
    channelType: ChannelType,
  ) {
    // Check if user exists
    const user = await this.usersService.findOne({ uuid: userUuid });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if channel exists or is deleted
    const channel = await this.channelsService.findOne({
      uuid: channelUuid,
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if section exists
    const section = await this.sectionsService.findOne({
      type: channelType,
      user: { id: user.id },
    });
    if (!section) throw new NotFoundException('Section not found');

    // Check if channel subscription already exists
    const existingChannelSubscription =
      await this.channelSubscriptionsRepository.findOneBy({
        user: { id: user.id },
        channel: { id: channel.id },
        isSubscribed: true,
      });

    if (existingChannelSubscription?.isSubscribed)
      throw new HttpException(
        'User is already subscribed to the channel',
        HttpStatus.BAD_REQUEST,
      );

    // Create channelSubscription
    // May want to create a service method that creates a channelSubscription and returns
    // In the correct format so we do not need to
    await this.channelSubscriptionsRepository.insert({
      user: { id: user.id },
      channel: { id: channel.id },
      section: { id: section.id },
    });

    const channelSubscription = await this.findUserChannel(
      userUuid,
      channelUuid,
    );

    this.channelGateway.handleJoinChannelSocket(channelSubscription);

    return channelSubscription;
  }

  async inviteUsers(
    channelUuid: string,
    userIds: string[],
    currentUserUuid: string,
  ) {
    for (let i = 0; i < userIds.length; i++) {
      try {
        await this.joinChannel(userIds[i], channelUuid, ChannelType.CHANNEL);
      } catch (err) {
        console.error(err);
      }
    }
    const channelUsers =
      await this.channelSubscriptionsRepository.findUsersByChannelId(
        channelUuid,
      );

    const userChannelToReturn = await this.findUserChannel(
      currentUserUuid,
      channelUuid,
    );

    userChannelToReturn.users = channelUsers;

    return userChannelToReturn;
  }

  async leaveChannel(userUuid: string, channelUuid: string) {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneByProperties(
        {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
          isSubscribed: true,
        },
        ['channel'],
      );

    if (!channelSubscription) {
      throw new NotFoundException('User-Channel link not found');
    }

    const section = await this.sectionsService.findDefaultSection(
      channelSubscription.channel.type,
      userUuid,
    );

    await this.channelSubscriptionsRepository.updateUserChannel(
      channelSubscription.uuid,
      {
        isSubscribed: false,
        section,
      },
    );

    const channelUsers =
      await this.channelSubscriptionsRepository.findUsersByChannelId(
        channelUuid,
      );

    const userChannelToReturn = await this.findUserChannel(
      userUuid,
      channelUuid,
    );

    userChannelToReturn.users = channelUsers;

    this.channelGateway.handleLeaveChannelSocket(channelUuid);

    return userChannelToReturn;
  }

  async removeUserFromChannel(
    userUuid: string,
    channelUuid: string,
    currentUserUuid: string,
  ) {
    await this.leaveChannel(userUuid, channelUuid);

    const channelUsers =
      await this.channelSubscriptionsRepository.findUsersByChannelId(
        channelUuid,
      );

    const userChannelToReturn = await this.findUserChannel(
      currentUserUuid,
      channelUuid,
    );

    userChannelToReturn.users = channelUsers;

    return userChannelToReturn;
  }

  async getUserChannelCount(channelId: number) {
    return this.channelSubscriptionsRepository.getChannelUsersCount(channelId);
  }

  async findUserChannel(
    userUuid: string,
    channelUuid: string,
  ): Promise<ChannelSubscriptionDto> {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneByProperties(
        {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
        ['channel', 'section'],
      );

    if (!channelSubscription) {
      throw new HttpException(
        'ChannelSubscription not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = {
      ...plainToClass(ChannelSubscriptionDto, channelSubscription),
      ...plainToClass(ChannelDto, channelSubscription.channel),
      sectionId: channelSubscription.section.uuid,
    };

    delete res.section;
    delete res.channel;

    return res;
  }

  async updateUserChannel(
    userUuid: string,
    channelUuid: string,
    updatedFields: Partial<ChannelSubscription>,
  ) {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneByProperties({
        user: { uuid: userUuid },
        channel: { uuid: channelUuid },
      });

    if (!channelSubscription) {
      throw new NotFoundException('No user channels found');
    }

    await this.channelSubscriptionsRepository.updateUserChannel(
      channelSubscription.uuid,
      updatedFields,
    );

    const updatedUserChannel = await this.findUserChannel(
      userUuid,
      channelUuid,
    );

    this.channelGateway.handleUpdateChannelSocket(updatedUserChannel);

    return updatedUserChannel;
  }

  async updateChannelSection(
    userUuid: string,
    channelUuid: string,
    sectionUuid: string,
  ) {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneByProperties(
        {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
        ['channel'],
      );

    const section = await this.sectionsService.findOne({
      uuid: sectionUuid,
    });

    if (!channelSubscription || !section)
      throw new HttpException(
        'No userchannel or section found',
        HttpStatus.BAD_REQUEST,
      );

    await this.channelSubscriptionsRepository.updateUserChannel(
      channelSubscription.uuid,
      {
        section,
      },
    );

    const updatedUserChannel = await this.findUserChannel(
      userUuid,
      channelUuid,
    );

    this.channelGateway.handleUpdateChannelSocket(updatedUserChannel);

    return updatedUserChannel;
  }

  async getUserSubscribedChannels(
    userUuid: string,
  ): Promise<{ channels: any; channelSubscriptionDetails: any }> {
    const channelSubscriptions = await this.channelSubscriptionsRepository.find(
      {
        where: { user: { uuid: userUuid } },
        relations: ['channel'],
      },
    );

    if (!channelSubscriptions) {
      throw new NotFoundException('No user channels found');
    }

    const channelSubscriptionDetails = [];

    const channels = await Promise.all(
      channelSubscriptions.map(async (channelSubscription) => {
        const channel = channelSubscription.channel;
        let directChannelName;

        if (channel.type === ChannelType.DIRECT) {
          const users =
            await this.channelSubscriptionsRepository.findUsersByChannelId(
              channelSubscription.channel.uuid,
            );

          if (channelSubscription.channel.type === ChannelType.DIRECT) {
            const otherUser = users.find(
              (user: User) => user.uuid !== userUuid,
            );

            directChannelName = `${otherUser.firstName} ${otherUser.lastName}`;
          }
        }

        const channels = {
          ...plainToClass(ChannelDto, channel),
          ...(channel.type === ChannelType.DIRECT && {
            name: directChannelName,
          }),
        };

        delete channelSubscription.channel;
        channelSubscriptionDetails.push(channelSubscription);

        return channels;
      }),
    );

    console.log('subscriptionDetails', channelSubscriptions);
    console.log('channels', channels);

    return { channels, channelSubscriptionDetails };
  }

  async getUserUnreadMessagesCount(
    userUuid: string,
  ): Promise<{ channelId: string; unreadCount: number }[]> {
    // Fetch user's channels with their lastRead timestamp
    const channelSubscriptions =
      await this.channelSubscriptionsRepository.findSubscribedChannelsByUserId(
        userUuid,
      );

    // For each channel, get the count of unread messages
    const unreadCountsPromises = channelSubscriptions.map(
      (channelSubscription) =>
        this.messagesService
          .getUnreadMessageCount(
            channelSubscription.channel.uuid,
            channelSubscription.lastRead,
          )
          .then((unreadCount) => ({
            channelId: channelSubscription.channel.uuid,
            unreadCount,
          })),
    );

    return Promise.all(unreadCountsPromises);
  }
}

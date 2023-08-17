import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';
import { plainToClass } from 'class-transformer';
import { ChannelDto } from 'src/channels/dto';
import { SectionsRepository } from 'src/sections/sections.repository';
import { ChannelSubscription } from './entity/channel-subscription.entity';
import { ChannelGateway } from 'src/websockets/channel.gateway';
import { MessagesRepository } from 'src/messages/messages.repository';
import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChannelSubscriptionsService {
  constructor(
    private channelSubscriptionsRepository: ChannelSubscriptionsRepository,
    private sectionsRepository: SectionsRepository,
    private channelGateway: ChannelGateway,
    private messageRepository: MessagesRepository,
  ) {}

  async joinChannel(userUuid: string, channelUuid: string) {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneByProperties({
        user: { uuid: userUuid },
        channel: { uuid: channelUuid },
      });

    if (!channelSubscription) {
      await this.channelSubscriptionsRepository.createUserChannel({
        userId: userUuid,
        channelId: channelUuid,
      });
    }

    if (!channelSubscription?.isSubscribed) {
      await this.updateUserChannel(userUuid, channelUuid, {
        isSubscribed: true,
      });
    }

    if (channelSubscription?.isSubscribed) {
      throw new HttpException(
        'User is already subscribed to the channel',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userChannelToReturn = await this.findUserChannel(
      userUuid,
      channelUuid,
    );

    this.channelGateway.handleJoinChannelSocket(userChannelToReturn);

    return userChannelToReturn;
  }

  async createAndSave(userId: string, channelId: string, sectionId: string) {
    return await this.channelSubscriptionsRepository.createAndSave(
      userId,
      channelId,
      sectionId,
    );
  }

  async inviteUsers(
    channelId: string,
    userIds: string[],
    currentUserId: string,
  ) {
    for (let i = 0; i < userIds.length; i++) {
      try {
        await this.joinChannel(userIds[i], channelId);
      } catch (err) {
        console.error(err);
      }
    }
    const channelUsers =
      await this.channelSubscriptionsRepository.findUsersByChannelId(channelId);

    const userChannelToReturn = await this.findUserChannel(
      currentUserId,
      channelId,
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

    const section = await this.sectionsRepository.findDefaultSection(
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
    userId: string,
    channelId: string,
    currentUserId: string,
  ) {
    await this.leaveChannel(userId, channelId);

    const channelUsers =
      await this.channelSubscriptionsRepository.findUsersByChannelId(channelId);

    const userChannelToReturn = await this.findUserChannel(
      currentUserId,
      channelId,
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

    if (!channelSubscription.section) {
      const defaultSection = await this.sectionsRepository.findDefaultSection(
        channelSubscription.channel.type,
        userUuid,
      );

      channelSubscription.section = defaultSection;
    }

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

    const section = await this.sectionsRepository.findOneByProperties({
      uuid: sectionUuid,
    });

    if (!channelSubscription || !section) {
      throw new HttpException(
        'No userchannel or section found',
        HttpStatus.BAD_REQUEST,
      );
    }

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
    userId: string,
  ): Promise<ChannelSubscriptionDto[]> {
    const channelSubscriptions =
      await this.channelSubscriptionsRepository.findByProperties(
        {
          user: { uuid: userId },
          isSubscribed: true,
        },
        ['channel', 'section'],
      );

    if (!channelSubscriptions) {
      throw new NotFoundException('No user channels found');
    }

    const channels = await Promise.all(
      channelSubscriptions.map(async (channelSubscription) => {
        const users =
          await this.channelSubscriptionsRepository.findUsersByChannelId(
            channelSubscription.channel.uuid,
          );

        let directChannelName;

        if (channelSubscription.channel.type === ChannelType.DIRECT) {
          const otherUser = users.find((user: User) => user.uuid !== userId);

          directChannelName = `${otherUser.firstName} ${otherUser.lastName}`;
        }

        const res = {
          ...plainToClass(ChannelSubscriptionDto, channelSubscription),
          ...plainToClass(ChannelDto, channelSubscription.channel),
          sectionId: channelSubscription.section.uuid,
          channelId: channelSubscription.channel.uuid,
          isSubscribed: true,
          users,
          name:
            channelSubscription.channel.type === ChannelType.DIRECT
              ? directChannelName
              : channelSubscription.channel.name,
        };

        delete res.section;
        delete res.channel;

        return res;
      }),
    );

    return channels;
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
        this.messageRepository
          .countUnreadMessages(
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

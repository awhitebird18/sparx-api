import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { ChannelSubscription } from './entity/channel-subscription.entity';

import { ChannelGateway } from 'src/websockets/channel.gateway';
import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';
import { SectionsRepository } from 'src/sections/sections.repository';
import { MessagesRepository } from 'src/messages/messages.repository';

import { CreateChannelSubscription } from './dto/create-channel-subscription.dto';
import { ChannelDto } from 'src/channels/dto/channel.dto';

@Injectable()
export class ChannelSubscriptionsService {
  constructor(
    private channelSubscriptionsRepository: ChannelSubscriptionsRepository,
    private sectionsRepository: SectionsRepository,
    private messagesRepository: MessagesRepository,
    private channelGateway: ChannelGateway,
  ) {}

  async create(createChannelSubscription: CreateChannelSubscription) {
    return await this.channelSubscriptionsRepository.save({
      user: { id: createChannelSubscription.userId },
      channel: { id: createChannelSubscription.channelId },
      section: { id: createChannelSubscription.sectionId },
    });
  }

  async findOne(findProperties: any) {
    return await this.channelSubscriptionsRepository.findOne(findProperties);
  }

  async leaveChannel(userUuid: string, channelUuid: string) {
    // Find channel subscription
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneOrFail({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
          isSubscribed: true,
        },
        relations: ['channel'],
      });

    // Find default section. If channel is in custom section, return it to default
    const section = await this.sectionsRepository.findOneOrFail({
      where: {
        type: channelSubscription.channel.type,
        user: { uuid: userUuid },
      },
    });

    // Update channel subscription
    await this.channelSubscriptionsRepository.updateUserChannel(
      channelSubscription.uuid,
      {
        isSubscribed: false,
        section,
      },
    );

    // Todo: review this
    // const channelUsers =
    //   await this.channelSubscriptionsRepository.findUsersByChannelId(
    //     channelUuid,
    //   );

    // const userChannelToReturn = await this.findUserChannel(
    //   userUuid,
    //   channelUuid,
    // );

    // Send over socket
    this.channelGateway.handleLeaveChannelSocket(channelUuid);

    return 'success';
  }

  async removeUserFromChannel(
    userUuid: string,
    channelUuid: string,
    currentUserUuid: string,
  ) {
    await this.leaveChannel(userUuid, channelUuid);

    // const channelUsers =
    //   await this.channelSubscriptionsRepository.findUsersByChannelId(
    //     channelUuid,
    //   );

    const userChannelToReturn = await this.findUserChannel(
      currentUserUuid,
      channelUuid,
    );

    // Todo: may need to attach users to channel to return
    // userChannelToReturn.users = channelUsers;

    return userChannelToReturn;
  }

  async getUserChannelCount(channelId: number) {
    return this.channelSubscriptionsRepository.getChannelUsersCount(channelId);
  }

  async findUserChannel(userUuid: string, channelUuid: string) {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneOrFail({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
        relations: ['channel', 'section'],
      });

    return plainToInstance(ChannelDto, channelSubscription.channel);
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
      await this.channelSubscriptionsRepository.findOneOrFail({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
        relations: ['channel'],
      });

    // Find section
    const section = await this.sectionsRepository.findOneOrFail({
      where: {
        uuid: sectionUuid,
      },
    });

    // Update channel subscriptions
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

  // async getUserSubscribedChannels(
  //   userUuid: string,
  // ): Promise<{ channels: any; channelSubscriptionDetails: any }> {
  //   const channelSubscriptions = await this.channelSubscriptionsRepository.find(
  //     {
  //       where: { user: { uuid: userUuid } },
  //       relations: ['channel'],
  //     },
  //   );

  //   if (!channelSubscriptions) {
  //     throw new NotFoundException('No user channels found');
  //   }

  //   const channelSubscriptionDetails = [];

  //   const channels = await Promise.all(
  //     channelSubscriptions.map(async (channelSubscription) => {
  //       const channel = channelSubscription.channel;
  //       let directChannelName;

  //       if (channel.type === ChannelType.DIRECT) {
  //         const users =
  //           await this.channelSubscriptionsRepository.findUsersByChannelId(
  //             channelSubscription.channel.uuid,
  //           );

  //         if (channelSubscription.channel.type === ChannelType.DIRECT) {
  //           const otherUser = users.find(
  //             (user: User) => user.uuid !== userUuid,
  //           );

  //           directChannelName = `${otherUser.firstName} ${otherUser.lastName}`;
  //         }
  //       }

  //       const channels = {
  //         ...plainToClass(ChannelDto, channel),
  //         ...(channel.type === ChannelType.DIRECT && {
  //           name: directChannelName,
  //         }),
  //       };

  //       delete channelSubscription.channel;
  //       channelSubscriptionDetails.push(channelSubscription);

  //       return channels;
  //     }),
  //   );

  //   return { channels, channelSubscriptionDetails };
  // }

  async getUserUnreadMessagesCount(
    userId: number,
  ): Promise<{ channelId: string; unreadCount: number }[]> {
    // Fetch user's channels with their lastRead timestamp
    const channelSubscriptions =
      await this.channelSubscriptionsRepository.findSubscribedChannelsByUserId(
        userId,
      );

    // For each channel, get the count of unread messages
    const unreadCountsPromises = channelSubscriptions.map(
      (channelSubscription) =>
        this.messagesRepository
          .getUnreadMessageCount(
            channelSubscription.channel.uuid,
            channelSubscription.lastRead,
          )
          .then((unreadCount) => ({
            channelId: channelSubscription.channel.uuid,
            unreadCount,
          })),
    );

    return await Promise.all(unreadCountsPromises);
  }
}

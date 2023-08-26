import { Injectable } from '@nestjs/common';

import { ChannelSubscription } from './entity/channel-subscription.entity';

import { ChannelGateway } from 'src/websockets/channel.gateway';
import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';
import { SectionsRepository } from 'src/sections/sections.repository';
import { MessagesRepository } from 'src/messages/messages.repository';

import { CreateChannelSubscription } from './dto/create-channel-subscription.dto';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';

@Injectable()
export class ChannelSubscriptionsService {
  constructor(
    private channelSubscriptionsRepository: ChannelSubscriptionsRepository,
    private sectionsRepository: SectionsRepository,
    private messagesRepository: MessagesRepository,
    private channelGateway: ChannelGateway,
  ) {}

  create(
    createChannelSubscription: CreateChannelSubscription,
  ): Promise<ChannelSubscription> {
    return this.channelSubscriptionsRepository.save({
      user: { id: createChannelSubscription.userId },
      channel: { id: createChannelSubscription.channelId },
      section: { id: createChannelSubscription.sectionId },
    });
  }

  findOne(findProperties: any): Promise<ChannelSubscription> {
    return this.channelSubscriptionsRepository.findOne(findProperties);
  }

  getUserChannelCount(channelId: number): Promise<number> {
    return this.channelSubscriptionsRepository.getChannelUsersCount(channelId);
  }

  findChannelSubscription(
    userUuid: string,
    channelUuid: string,
  ): Promise<ChannelSubscription> {
    return this.channelSubscriptionsRepository.findOneOrFail({
      where: {
        user: { uuid: userUuid },
        channel: { uuid: channelUuid },
      },
      relations: ['channel', 'section'],
    });
  }

  async udpateChannelSubscription(
    userUuid: string,
    channelUuid: string,
    updatedFields: ChannelSubscriptionDto,
  ): Promise<ChannelSubscription> {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneOrFail({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
      });

    // Update channel subscription
    Object.assign(channelSubscription, updatedFields);
    const updatedChannelSubscription =
      await this.channelSubscriptionsRepository.save(channelSubscription);

    // Send socket
    this.channelGateway.handleUpdateChannelSubscriptionSocket(
      updatedChannelSubscription,
    );

    return updatedChannelSubscription;
  }

  async updateChannelSection(
    userUuid: string,
    channelUuid: string,
    sectionUuid: string,
  ): Promise<ChannelSubscription> {
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

    // Update channel subscription
    const updateFields = { section };
    Object.assign(channelSubscription, updateFields);
    const updatedChannelSubscription =
      await this.channelSubscriptionsRepository.save(channelSubscription);

    this.channelGateway.handleUpdateChannelSubscriptionSocket(
      updatedChannelSubscription,
    );

    return updatedChannelSubscription;
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

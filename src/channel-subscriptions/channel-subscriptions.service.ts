import { Injectable } from '@nestjs/common';

import { ChannelSubscription } from './entity/channel-subscription.entity';

import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';
import { SectionsRepository } from 'src/sections/sections.repository';
import { MessagesRepository } from 'src/messages/messages.repository';

import { CreateChannelSubscription } from './dto/create-channel-subscription.dto';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';
import { User } from 'src/users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChannelSubscriptionsService {
  constructor(
    private channelSubscriptionsRepository: ChannelSubscriptionsRepository,
    private sectionsRepository: SectionsRepository,
    private messagesRepository: MessagesRepository,
    private events: EventEmitter2,
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

    this.events.emit(
      'websocket-event',
      'updateChannelSubscription',
      updatedChannelSubscription,
    );

    return updatedChannelSubscription;
  }

  async updateChannelSection(
    user: User,
    channelUuid: string,
    sectionUuid: string,
  ): Promise<ChannelSubscription> {
    try {
      const channelSubscription =
        await this.channelSubscriptionsRepository.findOneOrFail({
          where: {
            user: { id: user.id },
            channel: { uuid: channelUuid },
          },
          relations: ['channel'],
        });

      const section = await this.sectionsRepository.findOneOrFail({
        where: {
          uuid: sectionUuid,
        },
      });

      Object.assign(channelSubscription, { section: { id: section.id } });

      const updatedChannelSubscription =
        await this.channelSubscriptionsRepository.save(channelSubscription);

      this.events.emit(
        'websocket-event',
        'updateChannelSection',
        {
          channelId: channelUuid,
          sectionId: sectionUuid,
        },
        user.uuid,
      );

      return updatedChannelSubscription;
    } catch (error) {
      console.error('Error in updateChannelSection: ', error);
    }
  }

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

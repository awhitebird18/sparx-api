import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { ChannelSubscription } from './entity/channel-subscription.entity';

import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';
import { SectionsRepository } from 'src/sections/sections.repository';
import { MessagesRepository } from 'src/messages/messages.repository';

import { CreateChannelSubscription } from './dto/create-channel-subscription.dto';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';
import { User } from 'src/users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { ChannelType } from 'src/channels/enums/channel-type.enum';

@Injectable()
export class ChannelSubscriptionsService {
  constructor(
    private channelSubscriptionsRepository: ChannelSubscriptionsRepository,
    private sectionsRepository: SectionsRepository,
    private channelsRepository: ChannelsRepository,
    private messagesRepository: MessagesRepository,
    private events: EventEmitter2,
  ) {}

  create(
    createChannelSubscription: CreateChannelSubscription,
  ): Promise<ChannelSubscription> {
    return this.channelSubscriptionsRepository.save({
      user: { id: createChannelSubscription.userId },
      channel: { id: createChannelSubscription.channelId },
      section: { id: createChannelSubscription?.sectionId },
    });
  }

  async joinDefaultWorkspaceChannel(user: User, workspaceId: string) {
    try {
      const defaultChannel = await this.channelsRepository.findOne({
        where: { workspace: { uuid: workspaceId }, isDefault: true },
      });

      const defaultSection = await this.sectionsRepository.findDefaultSection(
        ChannelType.CHANNEL,
        user.id,
      );

      const subscription = await this.joinChannel(
        user,
        defaultChannel.uuid,
        defaultSection.uuid,
      );

      return subscription;
    } catch (err) {
      console.error(err);
    }
  }

  async joinChannel(
    user: User,
    channelUuid: string,
    sectionUuid?: string,
  ): Promise<any> {
    try {
      // Check if channel exists or is deleted
      const channel = await this.channelsRepository.findOneOrFail({
        where: {
          uuid: channelUuid,
        },
      });

      // Check if section exists
      const section = await this.sectionsRepository.findOneOrFail({
        where: {
          uuid: sectionUuid,
        },
      });

      // Check if channel subscription already exists
      const existingChannelSubscription =
        await this.channelSubscriptionsRepository.findOne({
          where: {
            user: { id: user.id },
            channel: { id: channel.id },
          },
        });

      if (existingChannelSubscription?.isSubscribed)
        throw new HttpException(
          'User is already subscribed to the channel',
          HttpStatus.BAD_REQUEST,
        );

      if (existingChannelSubscription) {
        // Update channel subscription
        await this.channelSubscriptionsRepository.update(
          existingChannelSubscription.id,
          { isSubscribed: true },
        );
      } else {
        // Create channelSubscription
        // Todo: May want to create a service method that creates a channelSubscription and returns
        // In the correct format so we do not need to
        // Save channel subscription
        const newChannelSubscription =
          this.channelSubscriptionsRepository.create({
            user,
            channel: { id: channel.id },
            section: { id: section.id },
          });
        await this.channelSubscriptionsRepository.save(newChannelSubscription);
      }

      // Todo: should have a listener setup to send out updated user counts
      // Todo: Need to send correct channel name here for direct channels
      const channelUserCount =
        await this.channelSubscriptionsRepository.getChannelUsersCount(
          channel.id,
        );

      // channel.name = await this.channelsService.findDirectChannelName(
      //   channel.uuid,
      //   userUuid,
      // );

      this.events.emit('websocket-event', 'updateChannelUserCount', {
        channelUuid: channel.uuid,
        userCount: channelUserCount,
      });

      const returnValue = await this.channelSubscriptionsRepository.findOne({
        where: { channel: { id: channel.id }, user: { id: user.id } },
        relations: ['channel'],
      });

      return returnValue;
    } catch (err) {
      console.error(err);
    }

    // Send over socket
    // Todo: Should send over the users updated section channels separately
  }

  findOne(findProperties: any): Promise<ChannelSubscription> {
    return this.channelSubscriptionsRepository.findOne(findProperties);
  }

  findUserChannels(user: User, workspaceId: string) {
    return this.channelSubscriptionsRepository.find({
      where: {
        user: { id: user.id },
        channel: { workspace: { uuid: workspaceId } },
      },
      relations: ['channel'],
    });
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

    await this.channelSubscriptionsRepository.save(channelSubscription);

    const returnChannel = await this.channelSubscriptionsRepository.findOne({
      where: { user: { uuid: userUuid }, channel: { uuid: channelUuid } },
      relations: ['channel'],
    });

    this.events.emit(
      'websocket-event',
      'updateChannelSubscription',
      returnChannel,
    );

    return returnChannel;
  }

  async updateLastRead(
    userUuid: string,
    channelUuid: string,
  ): Promise<ChannelSubscription> {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneOrFail({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
      });

    // Update channel subscription
    Object.assign(channelSubscription, { lastRead: new Date() });
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

    const unreads = await Promise.all(unreadCountsPromises);

    return unreads;
  }
}

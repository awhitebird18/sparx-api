import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChannelSubscription } from './entity/channel-subscription.entity';
import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';
import { SectionsRepository } from 'src/sections/sections.repository';
import { MessagesRepository } from 'src/messages/messages.repository';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';
import { User } from 'src/users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { UsersRepository } from 'src/users/users.repository';
import { plainToInstance } from 'class-transformer';
import { UnreadMessageCount } from './dto/unread-message-count.dto';
import { UpdateUserChannelDto } from './dto/update-channel-subscription.dto';

@Injectable()
export class ChannelSubscriptionsService {
  constructor(
    private channelSubscriptionsRepository: ChannelSubscriptionsRepository,
    private sectionsRepository: SectionsRepository,
    private channelsRepository: ChannelsRepository,
    private messagesRepository: MessagesRepository,
    private usersRepository: UsersRepository,
    private events: EventEmitter2,
  ) {}

  private convertToDto(
    channelSubscription: ChannelSubscription,
  ): ChannelSubscriptionDto {
    const channelId = channelSubscription.channel.uuid;
    const sectionId = channelSubscription?.section?.uuid;

    return plainToInstance(ChannelSubscriptionDto, {
      ...channelSubscription,
      channelId: channelId,
      sectionId: sectionId,
    });
  }

  async joinChannel(
    userId: string,
    channelUuid: string,
    sectionUuid?: string,
  ): Promise<ChannelSubscriptionDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: { uuid: userId },
      });

      const channel = await this.channelsRepository.findOneOrFail({
        where: {
          uuid: channelUuid,
        },
        relations: ['workspace'],
      });

      const workspace = channel.workspace;

      const section = await this.sectionsRepository.findOneOrFail({
        where: {
          uuid: sectionUuid,
        },
      });

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
        await this.channelSubscriptionsRepository.update(
          existingChannelSubscription.id,
          { isSubscribed: true },
        );
      } else {
        const newChannelSubscription =
          this.channelSubscriptionsRepository.create({
            user,
            channel: { id: channel.id },
            section: { id: section?.id },
          });
        await this.channelSubscriptionsRepository.save(newChannelSubscription);
      }

      const channelUserCount =
        await this.channelSubscriptionsRepository.getChannelUsersCount(
          channel.id,
        );

      const channelSubscription =
        await this.channelSubscriptionsRepository.findOne({
          where: { channel: { id: channel.id }, user: { id: user.id } },
          relations: ['channel', 'section'],
        });

      this.events.emit('websocket-event', 'updateChannelUserCount', {
        channelUuid: channel.uuid,
        userCount: channelUserCount,
      });

      this.events.emit('log.created', {
        userId: user.uuid,
        workspaceId: workspace.uuid,
        type: 'user',
        text: `has joined the ${channel.name} channel.`,
      });

      return this.convertToDto(channelSubscription);
    } catch (err) {
      console.error(err);
    }
  }

  async joinDefaultWorkspaceChannel(
    user: User,
    workspaceId: string,
  ): Promise<ChannelSubscriptionDto> {
    try {
      const defaultChannel = await this.channelsRepository.findOne({
        where: { workspace: { uuid: workspaceId }, isDefault: true },
      });

      const defaultSection = await this.sectionsRepository.findDefaultSection(
        user.id,
      );

      const subscriptionDto = await this.joinChannel(
        user.uuid,
        defaultChannel.uuid,
        defaultSection.uuid,
      );

      return subscriptionDto;
    } catch (err) {
      console.error(err);
    }
  }

  async findUserChannelsSubscriptions(
    user: User,
    workspaceId: string,
  ): Promise<ChannelSubscriptionDto[]> {
    const channelSubscriptions = await this.channelSubscriptionsRepository.find(
      {
        where: {
          user: { id: user.id },
          channel: { workspace: { uuid: workspaceId } },
        },
        relations: ['channel', 'section'],
      },
    );

    return channelSubscriptions.map((channelSubscription) =>
      this.convertToDto(channelSubscription),
    );
  }

  async findChannelSubscription(
    userUuid: string,
    channelUuid: string,
  ): Promise<ChannelSubscriptionDto> {
    const subscription =
      await this.channelSubscriptionsRepository.findOneOrFail({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
        relations: ['channel', 'section'],
      });

    return this.convertToDto(subscription);
  }

  async udpateChannelSubscription(
    userUuid: string,
    channelUuid: string,
    updatedFields: UpdateUserChannelDto,
  ): Promise<ChannelSubscriptionDto> {
    try {
      const channelSubscription =
        await this.channelSubscriptionsRepository.findOneOrFail({
          where: {
            user: { uuid: userUuid },
            channel: { uuid: channelUuid },
          },
        });

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

      const subscriptionDto = this.convertToDto(returnChannel);

      return subscriptionDto;
    } catch (error) {
      console.error('Unable to update subscription:', error);
    }
  }

  async updateLastRead(
    userUuid: string,
    channelUuid: string,
  ): Promise<ChannelSubscriptionDto> {
    const channelSubscription =
      await this.channelSubscriptionsRepository.findOneOrFail({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
        },
      });

    Object.assign(channelSubscription, { lastRead: new Date() });
    const updatedChannelSubscription =
      await this.channelSubscriptionsRepository.save(channelSubscription);

    this.events.emit(
      'websocket-event',
      'updateChannelSubscription',
      updatedChannelSubscription,
    );

    const subsciptionDto = this.convertToDto(updatedChannelSubscription);

    return subsciptionDto;
  }

  async updateChannelSection(
    user: User,
    channelUuid: string,
    sectionUuid: string,
  ): Promise<ChannelSubscriptionDto> {
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

      const subsciptionDto = this.convertToDto(updatedChannelSubscription);

      return subsciptionDto;
    } catch (error) {
      console.error('Error in updateChannelSection: ', error);
    }
  }

  async getChannelUnreadMessageCount(
    userId: number,
  ): Promise<UnreadMessageCount[]> {
    const channelSubscriptions =
      await this.channelSubscriptionsRepository.findSubscribedChannelsByUserId(
        userId,
      );

    const unreadCountsPromises = channelSubscriptions.map(
      (channelSubscription) =>
        this.messagesRepository
          .getChannelUnreadMessageCount(
            channelSubscription.channel?.uuid,
            channelSubscription.lastRead,
          )
          .then((unreadCount) => ({
            channelId: channelSubscription.channel?.uuid,
            unreadCount,
          })),
    );

    const unreadMessageCounts = await Promise.all(unreadCountsPromises);

    return unreadMessageCounts;
  }

  async leaveChannel(userUuid: string, channelUuid: string): Promise<void> {
    const user = await this.usersRepository.findOneOrFail({
      where: { uuid: userUuid },
    });

    const channel = await this.channelsRepository.findOneOrFail({
      where: {
        uuid: channelUuid,
      },
    });

    const channelSubscription =
      await this.channelSubscriptionsRepository.findOne({
        where: {
          user: { uuid: userUuid },
          channel: { uuid: channelUuid },
          isSubscribed: true,
        },
        relations: ['channel'],
      });

    if (!channelSubscription) {
      return;
    }
    // Todo: find section by uuid?
    const section = await this.sectionsRepository.findOneOrFail({
      where: {
        // type: channelSubscription.channel.type,
        user: { uuid: userUuid },
      },
    });

    const updateFields = {
      isSubscribed: false,
      section,
    };
    Object.assign(channelSubscription, updateFields);

    await this.channelSubscriptionsRepository.save(channelSubscription);

    const channelUserCount =
      await this.channelSubscriptionsRepository.getChannelUsersCount(
        channel.id,
      );

    this.events.emit(
      'websocket-event',
      'leaveChannel',
      false,
      user.uuid,
      channel.uuid,
    );

    this.events.emit('websocket-event', 'updateChannelUserCount', {
      channelUuid: channelUuid,
      userCount: channelUserCount,
    });

    await this.channelsRepository.findWorkspaceChannel(user.id, channel.uuid);
  }

  async removeUserFromChannel(
    userUuid: string,
    channelUuid: string,
  ): Promise<void> {
    await this.leaveChannel(userUuid, channelUuid);
  }
}

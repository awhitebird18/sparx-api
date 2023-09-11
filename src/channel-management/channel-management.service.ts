import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';
import { ChannelsService } from 'src/channels/channels.service';
import { ChannelSubscriptionsRepository } from 'src/channel-subscriptions/channel-subscriptions.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { SectionsRepository } from 'src/sections/sections.repository';
import { UsersRepository } from 'src/users/users.repository';

import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { CreateChannelDto } from 'src/channels/dto/create-channel.dto';
import { Channel } from 'src/channels/entities/channel.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { SectionType } from 'src/sections/enums/section-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChannelManagementService {
  constructor(
    private channelSubscriptionsService: ChannelSubscriptionsService,
    private channelsService: ChannelsService,
    private channelSubscriptionRepository: ChannelSubscriptionsRepository,
    private channelsRepository: ChannelsRepository,
    private sectionsRepository: SectionsRepository,
    private usersRepository: UsersRepository,
    private events: EventEmitter2,
  ) {}

  async createChannelAndJoin(
    createChannelDto: CreateChannelDto,
    currentUser: User,
    sectionUuid: string,
  ): Promise<Channel> {
    // Create channel
    const channel = await this.channelsService.createChannel(createChannelDto);

    const section = await this.sectionsRepository.findSectionByUuid(
      sectionUuid,
    );

    // Add user to channel
    await this.joinChannel(currentUser.uuid, channel.uuid, section.uuid);

    return channel;
  }

  async createDirectChannelAndJoin(
    userUuids: string[],
    currentUserId: number,
  ): Promise<Channel> {
    // Check if direct channel with both members already exists
    const channel = await this.channelsService.findDirectChannelByUserUuids(
      userUuids,
    );

    if (channel) {
      throw new ConflictException(
        `A direct channel with members [${userUuids.join(
          ', ',
        )}] already exists.`,
      );
    }

    // Create new direct message channel
    const newChannel = await this.channelsService.createChannel({
      type: ChannelType.DIRECT,
      name: userUuids.join(''),
    });

    // Add members to the channel
    const memberPromises = userUuids.map(async (userUuid: string) => {
      const user = await this.usersRepository.findOneOrFail({
        where: { uuid: userUuid },
      });
      const section = await this.sectionsRepository.findDefaultSection(
        ChannelType.DIRECT,
        user.id,
      );
      return this.joinChannel(userUuid, newChannel.uuid, section.uuid);
    });

    await Promise.all(memberPromises);

    newChannel.name = await this.channelsService.findDirectChannelName(
      newChannel.uuid,
      currentUserId,
    );
    // newChannel.name = `${user.firstName} ${user.lastName}`;

    return newChannel;
  }

  async joinChannel(
    userUuid: string,
    channelUuid: string,
    sectionUuid: string,
  ): Promise<Channel> {
    const user = await this.usersRepository.findOneOrFail({
      where: { uuid: userUuid },
    });
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
      await this.channelSubscriptionRepository.findOne({
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
      await this.channelSubscriptionRepository.update(
        existingChannelSubscription.id,
        { isSubscribed: true },
      );
    } else {
      // Create channelSubscription
      // Todo: May want to create a service method that creates a channelSubscription and returns
      // In the correct format so we do not need to
      // Save channel subscription
      const newChannelSubscription = this.channelSubscriptionRepository.create({
        user,
        channel: { id: channel.id },
        section: { id: section.id },
      });
      await this.channelSubscriptionRepository.save(newChannelSubscription);
    }

    // Todo: Need to send correct channel name here for direct channels
    const channelUserCount =
      await this.channelSubscriptionRepository.getChannelUsersCount(channel.id);

    // Send over socket
    // Todo: Should send over the users updated section channels separately
    this.events.emit('websocket-event', 'joinChannel', channel, section.uuid);

    this.events.emit('websocket-event', 'updateChannel', {
      channelUuid: channel.uuid,
      userCount: channelUserCount,
    });

    return channel;
  }

  async leaveChannel(userUuid: string, channelUuid: string): Promise<void> {
    // Check if channel exists or is deleted
    const channel = await this.channelsRepository.findOneOrFail({
      where: {
        uuid: channelUuid,
      },
    });
    // Find channel subscription
    const channelSubscription =
      await this.channelSubscriptionRepository.findOne({
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

    // Find default section. If channel is in custom section, return it to default
    const section = await this.sectionsRepository.findOneOrFail({
      where: {
        type: channelSubscription.channel.type,
        user: { uuid: userUuid },
      },
    });

    // Update channel subscription
    const updateFields = {
      isSubscribed: false,
      section,
    };
    Object.assign(channelSubscription, updateFields);

    await this.channelSubscriptionRepository.save(channelSubscription);

    const channelUserCount =
      await this.channelSubscriptionRepository.getChannelUsersCount(channel.id);

    // Send over socket

    this.events.emit('websocket-event', 'leaveChannel', channelUuid);

    this.events.emit('websocket-event', 'updateChannel', {
      channelUuid: channelUuid,
      userCount: channelUserCount,
    });
  }

  async removeUserFromChannel(
    userUuid: string,
    channelUuid: string,
    currentUserUuid: string,
  ): Promise<ChannelSubscription> {
    await this.leaveChannel(userUuid, channelUuid);

    // const channelUsers =
    //   await this.channelSubscriptionsRepository.findUsersByChannelId(
    //     channelUuid,
    //   );

    const userChannelToReturn =
      await this.channelSubscriptionsService.findChannelSubscription(
        currentUserUuid,
        channelUuid,
      );

    // Todo: may need to attach users to channel to return
    // userChannelToReturn.users = channelUsers;

    return userChannelToReturn;
  }

  async inviteUsers(
    channelUuid: string,
    userIds: string[],
    // currentUserId: number,
  ): Promise<string> {
    for (let i = 0; i < userIds.length; i++) {
      try {
        const user = await this.usersRepository.findUserByUuid(userIds[i]);
        const defaultUserSection =
          await this.sectionsRepository.findDefaultSection(
            SectionType.CHANNEL,
            user.id,
          );
        await this.joinChannel(
          userIds[i],
          channelUuid,
          defaultUserSection.uuid,
        );
      } catch (err) {
        console.error(err);
      }
    }

    // const channelUsers =
    //   await this.channelSubscriptionsRepository.findUsersByChannelId(
    //     channelUuid,
    //   );

    // Todo: need to return channel with users?
    // const updatedChannel = await this.channelsRepository.findOneOrFail({
    //   where: {
    //     uuid: channelUuid,
    //   },
    // });

    // userChannelToReturn.users = channelUsers;

    return 'success';
  }
}

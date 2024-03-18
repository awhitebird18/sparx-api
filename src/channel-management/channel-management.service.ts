import { ConflictException, Injectable } from '@nestjs/common';

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
    workspaceUuid: string,
  ): Promise<Channel> {
    // Create channel

    const channel = await this.channelsService.createChannel(
      createChannelDto,
      workspaceUuid,
      currentUser,
    );

    const section = await this.sectionsRepository.findSectionByUuid(
      sectionUuid,
    );

    // Add user to channel
    // await this.joinChannel(currentUser.uuid, channel.uuid, section.uuid);

    this.sendUserChannelSocket(currentUser.uuid, channel, section.uuid);

    return channel;
  }

  async updateUserRole(user: User, isAdmin: boolean, channelId: string) {
    const channel = await this.channelsRepository.findByUuid(channelId);
    return await this.channelSubscriptionRepository.updateUserRole(
      user,
      isAdmin,
      channel,
    );
  }

  async createDirectChannelAndJoin(
    userUuids: string[],
    workspaceUuid: string,
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
    const newChannel = await this.channelsService.createChannel(
      {
        type: ChannelType.DIRECT,
        name: userUuids.join(''),
      },
      workspaceUuid,
    );

    // Add members to the channel
    const memberPromises = userUuids.map(async (userUuid: string) => {
      const user = await this.usersRepository.findOneOrFail({
        where: { uuid: userUuid },
      });
      const section = await this.sectionsRepository.findDefaultSection(
        ChannelType.DIRECT,
        user.id,
      );
      // Fix this
      // return this.joinChannel(userUuid, newChannel.uuid, section.uuid);
    });

    await Promise.all(memberPromises);

    for (let i = 0; i < userUuids.length; i++) {
      newChannel.name = await this.channelsService.findDirectChannelName(
        newChannel.uuid,
        userUuids[i],
      );

      const user = await this.usersRepository.findOneOrFail({
        where: { uuid: userUuids[i] },
      });

      const section = await this.sectionsRepository.findDefaultSection(
        ChannelType.DIRECT,
        user.id,
      );

      this.sendUserChannelSocket(userUuids[i], newChannel, section.uuid);
    }

    // newChannel.name = `${user.firstName} ${user.lastName}`;

    return newChannel;
  }

  async sendUserChannelSocket(
    userId: string,
    channel: Channel,
    sectionUuid: string,
  ): Promise<void> {
    this.events.emit(
      'websocket-event',
      'joinChannel',
      channel,
      sectionUuid,
      userId,
    );
  }

  async leaveChannel(userUuid: string, channelUuid: string): Promise<void> {
    const user = await this.usersRepository.findOneOrFail({
      where: { uuid: userUuid },
    });
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

    this.events.emit(
      'websocket-event',
      'leaveChannel',
      false,
      user.uuid,
      channel.uuid,
    );
    // this.events.emit('websocket-event', 'update-channel', {
    //   isSubscribed: false,
    // });

    this.events.emit('websocket-event', 'updateChannelUserCount', {
      channelUuid: channelUuid,
      userCount: channelUserCount,
    });

    return this.channelsRepository.findWorkspaceChannel(user.id, channel.uuid);
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
        // Todo: fix this
        // await this.joinChannel(
        //   userIds[i],
        //   channelUuid,
        //   defaultUserSection.uuid,
        // );
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

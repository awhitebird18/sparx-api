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
import { ChannelGateway } from 'src/websockets/channel.gateway';

import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { CreateChannelDto } from 'src/channels/dto/create-channel.dto';
import { Channel } from 'src/channels/entities/channel.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChannelManagementService {
  constructor(
    private channelSubscriptionsService: ChannelSubscriptionsService,
    private channelsService: ChannelsService,
    private channelSubscriptionRepository: ChannelSubscriptionsRepository,
    private channelsRepository: ChannelsRepository,
    private sectionsRepository: SectionsRepository,
    private usersRepository: UsersRepository,
    private channelsGateway: ChannelGateway,
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

    const section = await this.sectionsRepository.findDefaultSection(
      ChannelType.DIRECT,
      currentUserId,
    );

    // Create new direct message channel
    const newChannel = await this.channelsService.createChannel({
      type: ChannelType.DIRECT,
    });

    // Add members to the channel
    const memberPromises = userUuids.map(async (userUuid: string) => {
      return this.joinChannel(userUuid, newChannel.uuid, section.uuid);
    });
    await Promise.all(memberPromises);

    // Todo: may need to send over socket to all members who are part of the channel

    return newChannel;
  }

  async joinChannel(
    userUuid: string,
    channelUuid: string,
    sectionUuid: string,
  ): Promise<Channel> {
    console.log(userUuid, channelUuid, sectionUuid);
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

    const channelUserCount =
      await this.channelSubscriptionRepository.getChannelUsersCount(channel.id);

    // Send over socket
    this.channelsGateway.joinChannel(channel, section.uuid);
    this.channelsGateway.updateChannelCount({
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
    this.channelsGateway.leaveChannel(channelUuid);

    this.channelsGateway.updateChannelCount({
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
    // currentUserUuid: string,
  ): Promise<Channel> {
    for (let i = 0; i < userIds.length; i++) {
      try {
        await this.joinChannel(userIds[i], channelUuid, ChannelType.CHANNEL);
      } catch (err) {
        console.error(err);
      }
    }

    // const channelUsers =
    //   await this.channelSubscriptionsRepository.findUsersByChannelId(
    //     channelUuid,
    //   );

    // Todo: need to return channel with users?
    const updatedChannel = await this.channelsRepository.findOneOrFail({
      where: {
        uuid: channelUuid,
      },
    });

    // userChannelToReturn.users = channelUsers;

    return updatedChannel;
  }
}

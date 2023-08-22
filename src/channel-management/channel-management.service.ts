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
    userId: string,
  ) {
    // Create channel
    const channel = await this.channelsService.createChannel(createChannelDto);

    // Add user to channel
    await this.joinChannel(userId, channel.uuid, ChannelType.CHANNEL);

    return channel;
  }

  async createDirectChannelAndJoin(userUuids: string[]) {
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
    });

    // Add members to the channel
    const memberPromises = userUuids.map(async (userUuid: string) => {
      return this.joinChannel(userUuid, newChannel.uuid, ChannelType.DIRECT);
    });
    await Promise.all(memberPromises);

    // Todo: may need to send over socket to all members who are part of the channel

    return newChannel;
  }

  async joinChannel(
    userUuid: string,
    channelUuid: string,
    channelType: ChannelType,
  ) {
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
        type: channelType,
        user: { id: user.id },
      },
    });

    // Check if channel subscription already exists
    const existingChannelSubscription =
      await this.channelSubscriptionRepository.findOne({
        where: {
          user: { id: user.id },
          channel: { id: channel.id },
          isSubscribed: true,
        },
      });

    if (existingChannelSubscription?.isSubscribed)
      throw new HttpException(
        'User is already subscribed to the channel',
        HttpStatus.BAD_REQUEST,
      );

    // Create channelSubscription
    // May want to create a service method that creates a channelSubscription and returns
    // In the correct format so we do not need to
    await this.channelSubscriptionRepository.save({
      user,
      channel: { id: channel.id },
      section: { id: section.id },
    });

    const channelSubscription =
      await this.channelSubscriptionsService.findUserChannel(
        user.uuid,
        channelUuid,
      );

    this.channelsGateway.handleJoinChannelSocket(channelSubscription);

    return channelSubscription;
  }

  async inviteUsers(
    channelUuid: string,
    userIds: string[],
    // currentUserUuid: string,
  ) {
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
    const userChannelToReturn = await this.channelsRepository.findOneOrFail({
      where: {
        uuid: channelUuid,
      },
    });

    // userChannelToReturn.users = channelUsers;

    return userChannelToReturn;
  }
}

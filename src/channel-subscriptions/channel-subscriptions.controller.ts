import { Controller, Param, Delete, Get, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { ChannelSubscriptionsService } from './channel-subscriptions.service';

import { User } from 'src/users/entities/user.entity';
import { ChannelSubscription } from './entity/channel-subscription.entity';

import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';

@ApiBearerAuth('access-token')
@Controller('channel-subscriptions')
export class ChannelSubscriptionsController {
  constructor(
    private readonly channelSubscriptionsService: ChannelSubscriptionsService,
  ) {}

  @Get()
  // async getUserSubscribedChannels(@GetUser() user: User) {
  //   return this.channelSubscriptionsService.getUserSubscribedChannels(
  //     user.uuid,
  //   );
  // }
  @Patch(':channelId')
  async updateUserChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: Partial<ChannelSubscription>,
  ) {
    return this.channelSubscriptionsService.updateUserChannel(
      user.uuid,
      channelId,
      updateUserChannel,
    );
  }

  @Patch('move/:channelId')
  async updateChannelSection(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: ChannelSubscriptionDto,
  ) {
    return await this.channelSubscriptionsService.updateChannelSection(
      user.uuid,
      channelId,
      updateUserChannel.sectionId,
    );
  }

  @Delete('leave/:channelId')
  async leaveChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ) {
    const channelSubscription = this.channelSubscriptionsService.leaveChannel(
      user.uuid,
      channelId,
    );

    return channelSubscription;
  }

  @Delete('remove/:channelId/:userId')
  async removeUserFromChannel(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string,
    @GetUser() currentUser: User,
  ) {
    const channelSubscription =
      this.channelSubscriptionsService.removeUserFromChannel(
        userId,
        channelId,
        currentUser.uuid,
      );

    return channelSubscription;
  }
}

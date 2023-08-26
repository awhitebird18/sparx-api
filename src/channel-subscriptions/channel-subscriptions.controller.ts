import { Controller, Param, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { ChannelSubscriptionsService } from './channel-subscriptions.service';

import { User } from 'src/users/entities/user.entity';

import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';

@ApiBearerAuth('access-token')
@Controller('channel-subscriptions')
export class ChannelSubscriptionsController {
  constructor(
    private readonly channelSubscriptionsService: ChannelSubscriptionsService,
  ) {}

  @Patch(':channelId')
  updateUserChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: ChannelSubscriptionDto,
  ): Promise<ChannelSubscriptionDto> {
    return this.channelSubscriptionsService.udpateChannelSubscription(
      user.uuid,
      channelId,
      updateUserChannel,
    );
  }

  @Patch('move/:channelId')
  updateChannelSection(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: ChannelSubscriptionDto,
  ): Promise<ChannelSubscriptionDto> {
    return this.channelSubscriptionsService.updateChannelSection(
      user.uuid,
      channelId,
      updateUserChannel.sectionId,
    );
  }
}

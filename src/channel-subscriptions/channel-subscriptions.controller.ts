import { Controller, Param, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { ChannelSubscriptionsService } from './channel-subscriptions.service';

import { User } from 'src/users/entities/user.entity';

import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth('access-token')
@Controller('channel-subscriptions')
export class ChannelSubscriptionsController {
  constructor(
    private readonly channelSubscriptionsService: ChannelSubscriptionsService,
  ) {}

  @Patch(':channelId')
  async updateUserChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: ChannelSubscriptionDto,
  ): Promise<ChannelSubscriptionDto> {
    const channelSubscription =
      await this.channelSubscriptionsService.udpateChannelSubscription(
        user.uuid,
        channelId,
        updateUserChannel,
      );

    return plainToInstance(ChannelSubscriptionDto, channelSubscription);
  }

  @Patch('move/:channelId')
  async updateChannelSection(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: ChannelSubscriptionDto,
  ): Promise<ChannelSubscriptionDto> {
    const channelSubscription =
      await this.channelSubscriptionsService.updateChannelSection(
        user.id,
        channelId,
        updateUserChannel.sectionId,
      );

    return plainToInstance(ChannelSubscriptionDto, channelSubscription);
  }
}

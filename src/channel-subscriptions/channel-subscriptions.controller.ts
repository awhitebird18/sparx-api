import {
  Controller,
  Param,
  Patch,
  Body,
  Get,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ChannelSubscriptionsService } from './channel-subscriptions.service';
import { User } from 'src/users/entities/user.entity';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';

@Controller('channel-subscriptions')
export class ChannelSubscriptionsController {
  constructor(
    private readonly channelSubscriptionsService: ChannelSubscriptionsService,
  ) {}

  @Post('join')
  joinChannel(
    @GetUser() user: User,
    @Body() data: { channelId: string; sectionId?: string },
  ): Promise<ChannelSubscriptionDto> {
    return this.channelSubscriptionsService.joinChannel(
      user,
      data.channelId,
      data.sectionId,
    );
  }

  @Post('join/defaults')
  joinDefaultWorkspaceChannel(
    @GetUser() user: User,
    @Query() workspaceId: string,
  ): Promise<ChannelSubscriptionDto> {
    return this.channelSubscriptionsService.joinDefaultWorkspaceChannel(
      user,
      workspaceId,
    );
  }

  @Get('workspace/:workspaceId')
  findUserChannelsSubscriptions(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ChannelSubscriptionDto[]> {
    return this.channelSubscriptionsService.findUserChannelsSubscriptions(
      user,
      workspaceId,
    );
  }

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

  @Patch('last-read/:channelId')
  updateLastRead(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<ChannelSubscriptionDto> {
    return this.channelSubscriptionsService.updateLastRead(
      user.uuid,
      channelId,
    );
  }

  @Patch('move/:channelId')
  updateChannelSection(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: ChannelSubscriptionDto,
  ): Promise<ChannelSubscriptionDto> {
    return this.channelSubscriptionsService.updateChannelSection(
      user,
      channelId,
      updateUserChannel.sectionId,
    );
  }

  @Delete('leave/:channelId')
  leaveChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<void> {
    return this.channelSubscriptionsService.leaveChannel(user.uuid, channelId);
  }

  @Delete('remove/:channelId/:userId')
  removeUserFromChannel(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.channelSubscriptionsService.removeUserFromChannel(
      userId,
      channelId,
    );
  }
}

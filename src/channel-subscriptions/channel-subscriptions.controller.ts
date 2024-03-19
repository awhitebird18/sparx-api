import {
  Controller,
  Param,
  Patch,
  Body,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ChannelSubscriptionsService } from './channel-subscriptions.service';
import { User } from 'src/users/entities/user.entity';
import { ChannelSubscriptionDto } from './dto/channel-subscription.dto';
import { plainToInstance } from 'class-transformer';

@Controller('channel-subscriptions')
export class ChannelSubscriptionsController {
  constructor(
    private readonly channelSubscriptionsService: ChannelSubscriptionsService,
  ) {}

  @Post('join')
  joinChannel(
    @GetUser() user: User,
    @Body() data: { channelId: string; sectionId?: string },
  ): Promise<any> {
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
  ): Promise<any> {
    return this.channelSubscriptionsService.joinDefaultWorkspaceChannel(
      user,
      workspaceId,
    );
  }

  @Get('workspace/:workspaceId')
  findWorkspaceUserCounts(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<any[]> {
    return this.channelSubscriptionsService.findUserChannels(user, workspaceId);
  }

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
  @Patch('last-read/:channelId')
  async updateLastRead(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<ChannelSubscriptionDto> {
    const channelSubscription =
      await this.channelSubscriptionsService.updateLastRead(
        user.uuid,
        channelId,
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
        user,
        channelId,
        updateUserChannel.sectionId,
      );

    return plainToInstance(ChannelSubscriptionDto, channelSubscription);
  }
}

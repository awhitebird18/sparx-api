import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { User } from 'src/users/entities/user.entity';

import { ChannelManagementService } from './channel-management.service';

import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { CreateChannelDto } from 'src/channels/dto/create-channel.dto';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { ChannelSubscriptionDto } from 'src/channel-subscriptions/dto/channel-subscription.dto';

@Controller('channel-management')
export class ChannelManagementController {
  constructor(
    private readonly channelManagementService: ChannelManagementService,
  ) {}

  @Post()
  createChannel(
    @GetUser() currentUser: User,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ChannelDto> {
    return this.channelManagementService.createChannelAndJoin(
      createChannelDto,
      currentUser.uuid,
    );
  }

  @Post('direct-channel')
  createDirectChannel(
    @Body() data: { memberIds: string[] },
  ): Promise<ChannelDto> {
    return this.channelManagementService.createDirectChannelAndJoin(
      data.memberIds,
    );
  }

  @Post('join/:channelId')
  joinChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<ChannelDto> {
    return this.channelManagementService.joinChannel(
      user.uuid,
      channelId,
      ChannelType.CHANNEL,
    );
  }

  @Post('invite/:channelId')
  inviteUsers(
    @Param('channelId') channelId: string,
    @Body() userIds: string[],
    // @GetUser() currentUser: User,
  ): Promise<ChannelDto> {
    return this.channelManagementService.inviteUsers(
      channelId,
      userIds,
      // currentUser.id,
    );
  }

  @Delete('leave/:channelId')
  leaveChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<void> {
    return this.channelManagementService.leaveChannel(user.uuid, channelId);
  }

  @Delete('remove/:channelId/:userId')
  async removeUserFromChannel(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string,
    @GetUser() currentUser: User,
  ): Promise<ChannelSubscriptionDto> {
    return this.channelManagementService.removeUserFromChannel(
      userId,
      channelId,
      currentUser.uuid,
    );
  }
}

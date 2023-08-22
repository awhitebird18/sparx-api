import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { User } from 'src/users/entities/user.entity';

import { ChannelManagementService } from './channel-management.service';

import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { CreateChannelDto } from 'src/channels/dto/create-channel.dto';

@Controller('channel-management')
export class ChannelManagementController {
  constructor(
    private readonly channelManagementService: ChannelManagementService,
  ) {}

  @ApiBody({ type: CreateChannelDto })
  @Post()
  async createChannel(
    @GetUser() currentUser: User,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return this.channelManagementService.createChannelAndJoin(
      createChannelDto,
      currentUser.uuid,
    );
  }

  @Post('direct-channel')
  async createDirectChannel(@Body() data: { memberIds: string[] }) {
    return this.channelManagementService.createDirectChannelAndJoin(
      data.memberIds,
    );
  }

  @Post('join/:channelId')
  async joinChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ) {
    const channelSubscription = this.channelManagementService.joinChannel(
      user.uuid,
      channelId,
      ChannelType.CHANNEL,
    );

    return channelSubscription;
  }

  @Post('invite/:channelId')
  async inviteUsers(
    @Param('channelId') channelId: string,
    @Body() userIds: string[],
    // @GetUser() currentUser: User,
  ) {
    const channelSubscription = await this.channelManagementService.inviteUsers(
      channelId,
      userIds,
      // currentUser.id,
    );

    return channelSubscription;
  }
}

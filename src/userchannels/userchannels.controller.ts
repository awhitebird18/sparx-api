import {
  Controller,
  Param,
  Post,
  Delete,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import { UserchannelsService } from './userchannels.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserChannel } from './entity/userchannel.entity';
import { UserChannelDto } from './dto/UserChannel.dto';

@ApiBearerAuth('access-token')
@Controller('userchannels')
export class UserchannelsController {
  constructor(private readonly userchannelsService: UserchannelsService) {}

  @Post('join/:channelId')
  async joinChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ) {
    const userChannel = this.userchannelsService.joinChannel(
      user.uuid,
      channelId,
    );

    return userChannel;
  }

  @Post('invite/:channelId')
  async inviteUsers(
    @Param('channelId') channelId: string,
    @Body() userIds: string[],
    @GetUser() currentUser: User,
  ) {
    const userChannel = await this.userchannelsService.inviteUsers(
      channelId,
      userIds,
      currentUser.uuid,
    );

    return userChannel;
  }

  @Get()
  async getUserSubscribedChannels(@GetUser() user: User) {
    return this.userchannelsService.getUserSubscribedChannels(user.uuid);
  }

  @Patch(':channelId')
  async updateUserChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: Partial<UserChannel>,
  ) {
    return this.userchannelsService.updateUserChannel(
      user.uuid,
      channelId,
      updateUserChannel,
    );
  }

  @Patch('move/:channelId')
  async updateChannelSection(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
    @Body() updateUserChannel: UserChannelDto,
  ) {
    return await this.userchannelsService.updateChannelSection(
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
    const userChannel = this.userchannelsService.leaveChannel(
      user.uuid,
      channelId,
    );

    return userChannel;
  }
}

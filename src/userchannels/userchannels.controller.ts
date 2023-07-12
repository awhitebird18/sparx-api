import { Controller, Param, Post, Delete, Get } from '@nestjs/common';
import { UserchannelsService } from './userchannels.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

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

  @Get()
  async getUserSubscribedChannels(@GetUser() user: User) {
    return this.userchannelsService.getUserSubscribedChannels(user.uuid);
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

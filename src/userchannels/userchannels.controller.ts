import { Controller, Param, Post, Delete, Get } from '@nestjs/common';
import { UserchannelsService } from './userchannels.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('userchannels')
export class UserchannelsController {
  constructor(private readonly userchannelsService: UserchannelsService) {}

  @Post('join/:channelUuid')
  async joinChannel(
    @GetUser() user: User,
    @Param('channelUuid') channelUuid: string,
  ) {
    const userChannel = this.userchannelsService.joinChannel(
      user.uuid,
      channelUuid,
    );

    return userChannel;
  }

  @Get()
  async getUserSubscribedChannels(@GetUser() user: User) {
    return this.userchannelsService.getUserSubscribedChannels(user.uuid);
  }

  @Delete('leave/:channelUuid')
  async leaveChannel(
    @GetUser() user: User,
    @Param('channelUuid') channelUuid: string,
  ) {
    const userChannel = this.userchannelsService.leaveChannel(
      user.uuid,
      channelUuid,
    );

    return userChannel;
  }
}

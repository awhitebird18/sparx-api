import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { HttpStatus } from '@nestjs/common/enums';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ChannelsService } from './channels.service';
import { User } from 'src/users/entities/user.entity';
import { ChannelDto } from './dto/channel.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelUserCount } from './dto/channel-user-count.dto';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}
  @Post()
  createChannel(
    @GetUser() currentUser: User,
    @Body()
    {
      createChannel,
      workspaceId,
    }: {
      createChannel: CreateChannelDto;
      workspaceId: string;
    },
  ): Promise<ChannelDto> {
    return this.channelsService.createChannel(
      createChannel,
      workspaceId,
      currentUser,
    );
  }

  @Get('workspaceId')
  findWorkspaceChannels(
    @GetUser() currentUser: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<
    | any
    | {
        channels: ChannelDto[];
        channelUserCounts: ChannelUserCount[];
      }
  > {
    return this.channelsService.findWorkspaceChannels(
      currentUser.id,
      workspaceId,
    );
  }

  @Get('user-count/:workspaceId')
  findChannelUserCounts(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ChannelUserCount[]> {
    return this.channelsService.findChannelUserCounts(workspaceId);
  }

  @Post('generate-roadmap')
  generateRoadmap(
    @Body() { topic, workspaceId }: { topic: string; workspaceId: string },
    @GetUser() user: User,
  ) {
    return this.channelsService.generateRoadmap({ topic, workspaceId, user });
  }

  @Get(':channelId/channel-users')
  findChannelUsers(@Param('channelId') channelId: string) {
    return this.channelsService.findChannelUsers(channelId);
  }

  @Patch(':channelId')
  updateChannel(
    @Param('channelId', new ParseUUIDPipe({ version: '4' }))
    channelId: string,
    @Body()
    data: { updateChannelDto: UpdateChannelDto; workspaceId: string },
  ): Promise<ChannelDto> {
    return this.channelsService.updateChannel(
      channelId,
      data.updateChannelDto,
      data.workspaceId,
    );
  }

  @Delete(':channelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('channelId', new ParseUUIDPipe({ version: '4' }))
    channelId: string,
  ) {
    return this.channelsService.removeChannel(channelId);
  }
}

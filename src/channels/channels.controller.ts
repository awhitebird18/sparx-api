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
import { Channel } from './entities/channel.entity';
import { UpdateChannelCoordinatesDto } from './dto/update-channel-coordinates';

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
  ): Promise<Channel> {
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
  ): Promise<ChannelDto[]> {
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
  ): Promise<ChannelDto[]> {
    return this.channelsService.generateRoadmap({ topic, workspaceId, user });
  }

  @Get(':channelId/channel-users')
  findChannelUsers(@Param('channelId') channelId: string): Promise<any> {
    return this.channelsService.findChannelUsers(channelId);
  }

  @Patch('positions')
  updateManyChannels(
    @Body()
    data: {
      channels: UpdateChannelCoordinatesDto[];
    },
  ): Promise<ChannelDto[]> {
    return this.channelsService.updateManyChannels(data.channels);
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

  @Patch('move/:channelId')
  moveChannel(
    @Param('channelId', new ParseUUIDPipe({ version: '4' }))
    channelId: string,
    @Body()
    data: { updateChannelDto: UpdateChannelDto; parentChannelId: string },
  ): Promise<ChannelDto[]> {
    return this.channelsService.moveChannel(
      channelId,
      data.updateChannelDto,
      data.parentChannelId,
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

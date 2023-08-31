import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { HttpStatus } from '@nestjs/common/enums';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { ChannelsService } from './channels.service';
import { User } from 'src/users/entities/user.entity';

import { ChannelDto } from './dto/channel.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelUserCount } from './dto/channel-user-count.dto';

@ApiBearerAuth('access-token')
@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @ApiBody({ type: CreateChannelDto })
  @Post()
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ChannelDto> {
    return this.channelsService.createChannel(createChannelDto);
  }

  @Get()
  findWorkspaceChannels(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<{
    channels: ChannelDto[];
    channelUserCounts: ChannelUserCount[];
  }> {
    return this.channelsService.findWorkspaceChannels(page, pageSize);
  }

  @Get('user-channels')
  findUserChannels(@GetUser() currentUser: User): Promise<ChannelDto[]> {
    return this.channelsService.findUserChannels(currentUser.id);
  }

  @Get('direct')
  findDirectChannel(
    @GetUser() currentUser: User,
    @Query('userUuid', new ParseUUIDPipe({ version: '4' })) userUuid: string,
  ): Promise<ChannelDto> {
    return this.channelsService.findDirectChannelByUserUuids([
      currentUser.uuid,
      userUuid,
    ]);
  }

  @Get(':channelId/users')
  findChannelUserIds(@Param('channelId') channelId: string) {
    return this.channelsService.findChannelUserIds(channelId);
  }

  @Patch(':channelUuid')
  updateChannel(
    @Param('channelUuid', new ParseUUIDPipe({ version: '4' }))
    channelUuid: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelDto> {
    return this.channelsService.updateChannel(channelUuid, updateChannelDto);
  }

  @Delete(':channelUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('channelUuid', new ParseUUIDPipe({ version: '4' }))
    channelUuid: string,
  ) {
    return await this.channelsService.removeChannel(channelUuid);
  }
}

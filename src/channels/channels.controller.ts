import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { NotFoundException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { ChannelsService } from './channels.service';
import { User } from 'src/users/entities/user.entity';
import { Channel } from './entities/channel.entity';

import { ChannelDto } from './dto/channel.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@ApiBearerAuth('access-token')
@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @ApiBody({ type: CreateChannelDto })
  @Post()
  async createChannel(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.createChannel(createChannelDto);
  }

  @Get()
  findWorkspaceChannels(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<{ channel: ChannelDto; userCount: number }[]> {
    return this.channelsService.findWorkspaceChannels(page, pageSize);
  }

  @Get('user-channels')
  findUserChannels(@GetUser() currentUser: User): Promise<Channel[]> {
    return this.channelsService.findUserChannels(currentUser.id);
  }

  @Get('direct')
  async findDirectChannel(
    @GetUser() currentUser: User,
    @Query('userUuid') userUuid: string,
  ) {
    return await this.channelsService.findDirectChannelByUserUuids([
      currentUser.uuid,
      userUuid,
    ]);
  }

  @Patch(':uuid')
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'UUID of the channel',
    example: '49e50109-1a78-4c66-a8d8-2c42219a82b1',
  })
  @ApiBody({
    description: 'Fields for updating a channel',
    schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', example: 'New discussion topic' },
      },
    },
  })
  updateChannel(
    @Param('uuid') uuid: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelsService.updateChannel(uuid, updateChannelDto);
  }

  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'UUID of the channel',
    example: '49e50109-1a78-4c66-a8d8-2c42219a82b1',
  })
  @Delete(':uuid')
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    const isChannelRemoved = await this.channelsService.removeChannel(uuid);

    if (!isChannelRemoved) {
      throw new NotFoundException(`Channel with UUID ${uuid} not found`);
    }

    return {
      status: HttpStatus.OK,
      message: 'Channel removed successfully',
    };
  }
}

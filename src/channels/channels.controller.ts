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
import { ChannelsService } from './channels.service';
import { CreateChannelDto, UpdateChannelDto } from './dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { NotFoundException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';

import { GetUser } from 'src/common/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserchannelsService } from 'src/userchannels/userchannels.service';

@ApiBearerAuth('access-token')
@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private userChannelService: UserchannelsService,
  ) {}

  @ApiBody({ type: CreateChannelDto })
  @Post()
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
    @GetUser() user: User,
  ) {
    return this.channelsService.createChannel(createChannelDto, user.uuid);
  }

  @Get()
  findWorkspaceChannels(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.channelsService.findWorkspaceChannels(page, pageSize);
  }

  @Get(':uuid')
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'UUID of the channel',
    example: '49e50109-1a78-4c66-a8d8-2c42219a82b1',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.channelsService.findOne(uuid);
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

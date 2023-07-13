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
import { ChannelDto, CreateChannelDto, UpdateChannelDto } from './dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { NotFoundException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { ChannelType } from './enums/channelType.enum';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserchannelsService } from 'src/userchannels/userchannels.service';
import { UserChannelDto } from 'src/userchannels/dto/UserChannel.dto';

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
  async findAll(@GetUser() user: User) {
    const workspaceChannels =
      await this.channelsService.findWorkspaceChannels();

    const subscribedChannels =
      await this.userChannelService.getUserSubscribedChannels(user.uuid);

    console.log(subscribedChannels);

    const res = workspaceChannels.map((channelDto: ChannelDto) => {
      const userChannel = subscribedChannels.find(
        (el: UserChannelDto) => el.channelId === channelDto.uuid,
      );

      if (userChannel?.isSubscribed) {
        channelDto.isSubscribed = true;
      } else {
        channelDto.isSubscribed = false;
      }
      return channelDto;
    });

    return res;
  }

  @Get('channel')
  findChannels(@Query('type') type: ChannelType) {
    return this.channelsService.findChannels(type);
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
        topic: { type: 'string', example: 'New discussion topicdfgdfgdfgfdg' },
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

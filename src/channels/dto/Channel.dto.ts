import { BaseDto } from 'src/common/dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './CreateChannel.dto';

export class ChannelDto extends IntersectionType(CreateChannelDto, BaseDto) {
  @ApiProperty({
    example: 'Lets disciuss frogs',
    description:
      'Publicly displayed topic that gives users the current topic of the channel',
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({
    example: 'This channel is for company announcements',
    description:
      'Publicly displayed description that provides information about the channel',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Company id in which the channel belongs to.',
  })
  @IsOptional()
  @IsUUID(4)
  companyId?: string;

  @ApiProperty({
    example: '/app/static/77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Channel icon. Path to image.',
  })
  @IsOptional()
  icon?: string;

  isSubscribed?: boolean;

  channelId?: string;

  @IsOptional()
  userCount?: number;
}

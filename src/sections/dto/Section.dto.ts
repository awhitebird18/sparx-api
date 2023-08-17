import { BaseDto } from 'src/common/dto';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './create-section.dto';

import { SectionType } from '../enums';
import { ChannelSubscriptionDto } from 'src/channel-subscriptions/dto/channel-subscription.dto';

export class SectionDto extends IntersectionType(CreateSectionDto, BaseDto) {
  @ApiProperty({
    example: [ChannelSubscriptionDto],
    description: 'Channels that exist under this section',
  })
  @IsArray()
  channels: ChannelSubscriptionDto[];

  @ApiProperty({
    example: true,
    description: 'Defines if section is system generated',
  })
  @IsBoolean()
  isSystem: boolean;

  @ApiProperty({
    example: true,
    description: 'Defines if section is open',
  })
  @IsBoolean()
  isOpen: boolean;

  @ApiProperty({
    example: 'channel',
    description: 'Type of the section',
  })
  @IsNotEmpty()
  @IsEnum(SectionType)
  type: SectionType;
}

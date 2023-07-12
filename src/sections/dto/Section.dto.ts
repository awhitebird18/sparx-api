import { BaseDto } from 'src/common/dto';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './CreateSection.dto';

import { SectionType } from '../enums';
import { UserChannelDto } from 'src/userchannels/dto/UserChannel.dto';

export class SectionDto extends IntersectionType(CreateSectionDto, BaseDto) {
  @ApiProperty({
    example: [UserChannelDto],
    description: 'Channels that exist under this section',
  })
  @IsArray()
  channels: UserChannelDto[];

  @ApiProperty({
    example: true,
    description: 'Defines if section is system generated',
  })
  @IsBoolean()
  isSystem: boolean;

  @ApiProperty({
    example: 'channel',
    description: 'Type of the section',
  })
  @IsNotEmpty()
  @IsEnum(SectionType)
  type: SectionType;
}

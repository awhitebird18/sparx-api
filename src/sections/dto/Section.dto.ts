import { BaseDto } from 'src/common/dto';
import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './CreateSection.dto';
import { ChannelDto } from 'src/channels/dto';

export class SectionDto extends IntersectionType(CreateSectionDto, BaseDto) {
  @ApiProperty({
    example: [ChannelDto],
    description: 'Channels that exist under this section',
  })
  @IsArray()
  channels: ChannelDto[];
}

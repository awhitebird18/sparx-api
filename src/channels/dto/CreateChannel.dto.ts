import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChannelType } from '../enums/channelType.enum';

export class CreateChannelDto {
  @ApiProperty({
    example: 'Announcements',
    description: 'Publicly displayed name of the channel',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'direct',
    description: 'Type of channel',
  })
  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: ChannelType;

  @ApiProperty({
    example: false,
    description:
      'Sets a channel to be private. Private channels are invite only',
  })
  @IsNotEmpty()
  @IsBoolean()
  isPrivate: boolean;
}

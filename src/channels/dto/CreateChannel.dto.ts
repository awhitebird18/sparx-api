import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({
    example: 'Announcements',
    description: 'Publicly displayed name of the channel',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Direct Message',
    description: 'Type of channel',
  })
  @IsNotEmpty()
  @IsString()
  type: string;
}

import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserChannelDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'Number of channel',
    description: 'UUID of channel',
  })
  @IsNotEmpty()
  channelId: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/common/dto/Base.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class MessageDto extends BaseDto {
  @ApiProperty({
    example: 'Hey John, how are you?',
    description: 'Serialized Lexical message content.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Message channelId',
  })
  @IsNotEmpty()
  @IsUUID(4)
  channelId: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Message userId',
  })
  @IsNotEmpty()
  @IsUUID(4)
  userId: string;
}

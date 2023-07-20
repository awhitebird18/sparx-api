import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Message } from '../entities/message.entity';

export class CreateReactionDto {
  @ApiProperty({
    example: 'Hey John, how are you?',
    description: 'Serialized Lexical message content.',
  })
  @IsNotEmpty()
  @IsString()
  message: Message;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'User uuid',
  })
  @IsNotEmpty()
  @IsUUID(4)
  userId: string;

  @ApiProperty({
    example: '+1',
    description: 'Emoji Id',
  })
  @IsNotEmpty()
  emojiId: string;
}

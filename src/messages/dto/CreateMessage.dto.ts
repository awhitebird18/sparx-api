import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Column } from 'typeorm';

export class CreateMessageDto {
  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'uuid of the new message',
  })
  @Column()
  uuid: string;

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

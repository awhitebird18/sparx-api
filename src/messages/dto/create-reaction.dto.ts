import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReactionDto {
  @IsNotEmpty()
  @IsString()
  emojiId: string;

  @IsNotEmpty()
  @IsUUID(4)
  messageId: string;

  @IsNotEmpty()
  @IsUUID(4)
  userId: string;
}

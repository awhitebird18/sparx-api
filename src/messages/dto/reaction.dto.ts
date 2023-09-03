import { IsArray, IsNumber, IsString } from 'class-validator';

export class ReactionDto {
  @IsString()
  emojiId: string;

  @IsArray()
  users: string[];

  @IsNumber()
  count: number;
}

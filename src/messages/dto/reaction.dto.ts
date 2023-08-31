import { IsString, IsUUID } from 'class-validator';

import { BaseDto } from 'src/common/dto/base.dto';

export class ReactionDto extends BaseDto {
  @IsString()
  emojiId: string;

  @IsUUID(4)
  userId: string;

  @IsUUID(4)
  messageId: string;
}

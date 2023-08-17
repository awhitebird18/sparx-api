import { BaseDto } from 'src/common/dto/base.dto';

export class ReactionDto extends BaseDto {
  userId: string;

  emojiId: string;

  messageId?: string;

  uuid: string;
}

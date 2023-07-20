import { BaseDto } from 'src/common/dto/Base.dto';

export class ReactionDto extends BaseDto {
  userId: string;

  emojiId: string;

  messageId?: string;

  uuid: string;
}

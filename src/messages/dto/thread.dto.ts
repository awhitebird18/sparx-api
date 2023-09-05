import { IsString } from 'class-validator';

import { BaseDto } from 'src/common/dto/base.dto';
import { Message } from '../entities/message.entity';

export class ThreadDto extends BaseDto {
  @IsString()
  rootMessage: Message;

  latestReplies: Message[];

  replyCount: number;
}

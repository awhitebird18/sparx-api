import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';

import { BaseDto } from 'src/common/dto/base.dto';
import { ReactionDto } from './reaction.dto';

export class MessageDto extends BaseDto {
  @IsString()
  content: string;

  reactions: ReactionDto[];

  @IsUUID(4)
  channelId: string;

  @IsUUID(4)
  userId: string;

  @IsUUID(4)
  parentId?: string;

  @IsBoolean()
  isSystem: boolean;

  @IsNumber()
  threadCount?: number;
}

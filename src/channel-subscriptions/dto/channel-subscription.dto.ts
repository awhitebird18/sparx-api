import { IsBoolean, IsDate, IsEnum, IsUUID } from 'class-validator';
import { BaseDto } from 'src/common/dto';
import { CompletionStatus } from '../enum/completion-status.enum';

export class ChannelSubscriptionDto extends BaseDto {
  @IsUUID(4)
  channelId: string;

  @IsUUID(4)
  sectionId: string;

  @IsDate()
  lastRead?: Date;

  @IsBoolean()
  isMuted: boolean;

  @IsBoolean()
  isAdmin: boolean;

  @IsBoolean()
  isSubscribed: boolean;

  @IsEnum({ default: CompletionStatus.InProgress })
  status: CompletionStatus;
}

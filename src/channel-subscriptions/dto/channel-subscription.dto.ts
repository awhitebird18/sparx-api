import { IsBoolean, IsDate, IsUUID } from 'class-validator';
import { BaseDto } from 'src/common/dto';

export class ChannelSubscriptionDto extends BaseDto {
  @IsBoolean()
  isSubscribed: boolean;

  @IsDate()
  lastRead?: string | Date;

  @IsBoolean()
  isMuted: boolean;

  @IsUUID(4)
  userId: string;

  @IsUUID(4)
  sectionId: string;

  @IsUUID(4)
  channelId: string;
}

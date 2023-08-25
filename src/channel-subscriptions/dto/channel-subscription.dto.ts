import { IsBoolean, IsDate, IsUUID } from 'class-validator';
import { BaseDto } from 'src/common/dto';

export class ChannelSubscriptionDto extends BaseDto {
  @IsUUID(4)
  sectionId: string;

  @IsUUID(4)
  channelId: string;

  @IsDate()
  lastRead?: Date;

  @IsBoolean()
  isMuted: boolean;
}

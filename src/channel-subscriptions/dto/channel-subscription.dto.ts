import { IsBoolean } from 'class-validator';
import { ChannelDto } from 'src/channels/dto';
import { BaseDto } from 'src/common/dto';
import { SectionDto } from 'src/sections/dto';
import { UserDto } from 'src/users/dto';
import { User } from 'src/users/entities/user.entity';

export class ChannelSubscriptionDto extends BaseDto {
  user: UserDto;

  channel: ChannelDto;

  section: SectionDto;

  @IsBoolean()
  isMuted: boolean;

  @IsBoolean()
  isSubscribed: boolean;

  sectionId: string;

  channelId?: string;

  users: User[];

  lastRead?: string | Date;
}

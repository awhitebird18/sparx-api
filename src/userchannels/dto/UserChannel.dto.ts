import { IsBoolean } from 'class-validator';
import { ChannelDto } from 'src/channels/dto';
import { BaseDto } from 'src/common/dto';
import { SectionDto } from 'src/sections/dto';
import { UserDto } from 'src/users/dto';

export class UserChannelDto extends BaseDto {
  user: UserDto;

  channel: ChannelDto;

  section: SectionDto;

  @IsBoolean()
  isMuted: boolean;

  @IsBoolean()
  isSubscribed: boolean;
}

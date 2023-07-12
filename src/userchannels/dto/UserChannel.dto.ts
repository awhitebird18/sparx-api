import { IsBoolean } from 'class-validator';
import { ChannelDto } from 'src/channels/dto';
import { BaseDto } from 'src/common/dto';
import { UserDto } from 'src/users/dto';

export class UserChannelDto extends BaseDto {
  user: UserDto;

  channel: ChannelDto;

  @IsBoolean()
  isMuted: boolean;

  @IsBoolean()
  isSubscribed: boolean;
}

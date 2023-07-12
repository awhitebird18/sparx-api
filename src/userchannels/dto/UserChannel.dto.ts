import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';

import { ChannelDto } from 'src/channels/dto';

export class UserChannelDto extends PartialType(ChannelDto) {
  @IsBoolean()
  isMuted: boolean;

  @IsBoolean()
  isSubscribed: boolean;
}

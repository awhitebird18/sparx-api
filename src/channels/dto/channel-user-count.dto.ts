import { IsNumber, IsString } from 'class-validator';

export class ChannelUserCount {
  @IsString()
  channelUuid: string;

  @IsNumber()
  userCount: number;
}

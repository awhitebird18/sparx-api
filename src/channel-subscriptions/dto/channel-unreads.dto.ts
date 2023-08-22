import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class ChannelUnreads {
  @IsNotEmpty()
  @IsUUID(4)
  channelId: string;

  @IsNotEmpty()
  @IsNumber()
  unreadCount: number;
}

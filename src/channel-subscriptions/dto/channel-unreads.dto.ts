import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class ChannelUnreadsDto {
  @IsNotEmpty()
  @IsUUID(4)
  channelId: string;

  @IsNumber()
  unreadCount: number;
}

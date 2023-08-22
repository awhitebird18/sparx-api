import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChannelSubscription {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  sectionId: number;
}

import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChannelType } from '../enums/channel-type.enum';

export class CreateChannelDto {
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: ChannelType;

  @IsBoolean()
  isPrivate?: boolean;
}

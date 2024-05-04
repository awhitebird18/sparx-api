import { IsBoolean, IsDecimal, IsString } from 'class-validator';
import { Channel } from '../entities/channel.entity';

export class CreateChannelDto {
  @IsString()
  name?: string;

  @IsString()
  workspaceId?: string;

  @IsDecimal()
  x?: number;

  @IsDecimal()
  y?: number;

  @IsBoolean()
  isPrivate?: boolean;

  @IsBoolean()
  isDefault?: boolean;

  parentChannel?: Channel;

  parentChannelId?: string;

  childChannels?: Channel[];
}

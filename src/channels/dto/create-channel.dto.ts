import {
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ChannelType } from '../enums/channel-type.enum';

export class CreateChannelDto {
  @IsString()
  name?: string;

  @IsString()
  workspaceId?: string;

  @IsDecimal()
  x?: number;

  @IsDecimal()
  y?: number;

  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: ChannelType;

  @IsBoolean()
  isPrivate?: boolean;

  @IsBoolean()
  isDefault?: boolean;
}

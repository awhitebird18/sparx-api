import { BaseDto } from 'src/common/dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ChannelType } from '../enums/channel-type.enum';

export class ChannelDto extends BaseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  icon?: string;

  @IsBoolean()
  isPrivate: boolean;

  @IsBoolean()
  isDefault?: boolean;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  status?: string;
}

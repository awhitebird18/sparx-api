import { BaseDto } from 'src/common/dto';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

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

  @IsString()
  status?: string;

  @IsString()
  parentChannelId: string;

  @IsArray()
  childChannelIds: string[];
}

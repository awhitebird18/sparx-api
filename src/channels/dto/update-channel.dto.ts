import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto {
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
}

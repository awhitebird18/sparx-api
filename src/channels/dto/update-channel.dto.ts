import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto {
  @IsString()
  uuid: string;

  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  icon?: string;

  @IsBoolean()
  isPrivate?: boolean;

  @IsNumber()
  x?: number;

  @IsNumber()
  y?: number;
}

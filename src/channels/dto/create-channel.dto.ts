import { IsBoolean, IsDecimal, IsString } from 'class-validator';

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
}

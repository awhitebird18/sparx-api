import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsUUID(4)
  channelId: string;

  @IsNotEmpty()
  @IsUUID(4)
  userId: string;

  @IsOptional()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}

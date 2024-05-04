import { IsBoolean, IsDate, IsOptional, IsUUID } from 'class-validator';
import { CompletionStatus } from '../enum/completion-status.enum';

export class UpdateUserChannelDto {
  @IsUUID(4)
  @IsOptional()
  sectionId?: string;

  @IsDate()
  @IsOptional()
  lastRead?: Date;

  @IsBoolean()
  @IsOptional()
  isMuted?: boolean;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;

  @IsOptional()
  status?: CompletionStatus;
}

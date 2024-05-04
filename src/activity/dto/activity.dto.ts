import { BaseDto } from 'src/common/dto';
import { ActivityTypeEnum } from '../enums/activity-type.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class ActivityDto extends BaseDto {
  @IsEnum(ActivityTypeEnum)
  type: ActivityTypeEnum;

  @IsString()
  text: string;

  @IsUUID(4)
  @IsOptional()
  referenceId: string;

  @Transform(({ obj }) => obj.user.uuid)
  @IsUUID(4)
  userId: string;
}

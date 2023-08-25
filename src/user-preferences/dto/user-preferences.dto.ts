import { IsEnum } from 'class-validator';

import { PrimaryColor } from 'src/users/enums/primary-color.enum';
import { Theme } from 'src/users/enums/theme.enum';
import { BaseDto } from 'src/common/dto';
import { NotificationType } from '../enums/notification-type.enum';
import { Exclude } from 'class-transformer';

export class UserPreferencesDto extends BaseDto {
  @IsEnum(PrimaryColor)
  primaryColor: PrimaryColor;

  @IsEnum(Theme)
  theme: Theme;

  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @Exclude()
  userId: number;
}

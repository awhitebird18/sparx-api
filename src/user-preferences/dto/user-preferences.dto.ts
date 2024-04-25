import { IsEnum } from 'class-validator';
import { PrimaryColor } from 'src/users/enums/primary-color.enum';
import { Theme } from 'src/users/enums/theme.enum';
import { BaseDto } from 'src/common/dto';
import { Exclude } from 'class-transformer';

export class UserPreferencesDto extends BaseDto {
  @IsEnum(Theme)
  theme: Theme;

  @IsEnum(PrimaryColor)
  primaryColor: PrimaryColor;

  @Exclude()
  userId: number;
}

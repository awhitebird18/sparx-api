import { IsEnum, IsOptional } from 'class-validator';
import { PrimaryColor } from 'src/users/enums/primary-color.enum';
import { Theme } from 'src/users/enums/theme.enum';

export class CreateUserPreferences {
  @IsOptional()
  @IsEnum(PrimaryColor)
  primaryColor?: PrimaryColor;

  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;
}

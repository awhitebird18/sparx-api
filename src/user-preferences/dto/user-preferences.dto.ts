import { PrimaryColor, Theme } from 'src/users/enums';
import { NotificationType } from '../enums';

export class UserPreferencesDto {
  primaryColor: PrimaryColor;

  theme: Theme;

  notificationType: NotificationType;
}

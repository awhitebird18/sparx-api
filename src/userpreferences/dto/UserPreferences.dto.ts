import { PrimaryColor, Theme } from 'src/users/enums';
import { NotificationType } from '../enums/notificationType.enum';

export class UserpreferencesDto {
  primaryColor: PrimaryColor;

  theme: Theme;

  notificationType: NotificationType;
}

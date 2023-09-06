import { StatusDuration } from '../enums/status-duration.enum';

export class UserStatusDto {
  emoji: string;

  text: string;

  dateExpire: Date;

  duration: StatusDuration;

  isActive: boolean;
}

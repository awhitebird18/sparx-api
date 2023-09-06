import { StatusDuration } from '../enums/status-duration.enum';

export class UpdateUserStatusDto {
  emoji: string;

  text: string;

  dateExpire: string;

  duration: StatusDuration;
}

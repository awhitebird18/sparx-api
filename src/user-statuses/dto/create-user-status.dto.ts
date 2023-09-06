import { StatusDuration } from '../enums/status-duration.enum';

export class CreateUserStatusDto {
  emoji: string;

  text: string;

  dateExpire: Date;

  duration: StatusDuration;
}

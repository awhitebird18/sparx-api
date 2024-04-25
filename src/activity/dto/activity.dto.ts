import { ActivityTypeEnum } from '../enums/activity-type.enum';

export class ActivityDto {
  referenceId: string;
  text: string;
  type: ActivityTypeEnum;
  userId: string;
}

import { BaseDto } from 'src/common/dto';

export class TaskDto extends BaseDto {
  dueDate: Date;
  name: string;
  isComplete: boolean;
}

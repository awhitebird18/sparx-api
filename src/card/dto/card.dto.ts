import { BaseDto } from 'src/common/dto';

export class CardDto extends BaseDto {
  frontValues: string[];
  backValues: string[];
  createdBy: string;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
}

import { PartialType } from '@nestjs/swagger';
import { CreateReviewHistoryDto } from './create-review-history.dto';

export class UpdateReviewHistoryDto extends PartialType(
  CreateReviewHistoryDto,
) {}

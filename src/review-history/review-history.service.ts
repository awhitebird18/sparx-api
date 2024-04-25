import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { ReviewHistoryRepository } from './review-history.repository';

@Injectable()
export class ReviewHistoryService {
  constructor(
    private readonly reviewHistoryRepository: ReviewHistoryRepository,
  ) {}

  findReviewHistoryToday(user: User) {
    return this.reviewHistoryRepository.count({
      where: { user: { id: user.id }, dateReviewed: new Date() },
    });
  }

  findReviewHistoryLast30Days(user: User) {
    return this.reviewHistoryRepository.findReviewHistoryLast30Days(user);
  }

  async findReviewHistoryLastYear(user: User) {
    return this.reviewHistoryRepository.findReviewHistoryLastYear(user);
  }
}

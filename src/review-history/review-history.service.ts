import { Injectable } from '@nestjs/common';
import { CreateReviewHistoryDto } from './dto/create-review-history.dto';
import { UpdateReviewHistoryDto } from './dto/update-review-history.dto';
import { User } from 'src/users/entities/user.entity';
import { ReviewHistoryRepository } from './review-history.repository';

@Injectable()
export class ReviewHistoryService {
  constructor(
    private readonly reviewHistoryRepository: ReviewHistoryRepository,
  ) {}
  create(createReviewHistoryDto: CreateReviewHistoryDto) {
    return 'This action adds a new reviewHistory';
  }

  findAll() {
    return `This action returns all reviewHistory`;
  }

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

  findOne(id: number) {
    return `This action returns a #${id} reviewHistory`;
  }

  update(id: number, updateReviewHistoryDto: UpdateReviewHistoryDto) {
    return `This action updates a #${id} reviewHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} reviewHistory`;
  }
}

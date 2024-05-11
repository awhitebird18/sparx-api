import { Controller, Get } from '@nestjs/common';
import { ReviewHistoryService } from './review-history.service';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('review-history')
export class ReviewHistoryController {
  constructor(private readonly reviewHistoryService: ReviewHistoryService) {}

  @Get('today')
  findReviewedToday(@GetUser() user: User) {
    return this.reviewHistoryService.findReviewHistoryToday(user);
  }

  @Get('last-30-days')
  findReviewHistoryLast30Days(@GetUser() user: User) {
    return this.reviewHistoryService.findReviewHistoryLast30Days(user);
  }

  @Get('yearly-stats')
  getYearlyStats(@GetUser() user: User) {
    return this.reviewHistoryService.findReviewHistoryLastYear(user);
  }
}

import { Module } from '@nestjs/common';
import { ReviewHistoryService } from './review-history.service';
import { ReviewHistoryController } from './review-history.controller';
import { ReviewHistoryRepository } from './review-history.repository';

@Module({
  controllers: [ReviewHistoryController],
  providers: [ReviewHistoryService, ReviewHistoryRepository],
  exports: [ReviewHistoryRepository],
})
export class ReviewHistoryModule {}

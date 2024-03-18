import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ReviewHistory } from './entities/review-history.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ReviewHistoryRepository extends Repository<ReviewHistory> {
  constructor(private dataSource: DataSource) {
    super(ReviewHistory, dataSource.createEntityManager());
  }

  async findReviewHistoryLast30Days(user: User) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const reviewHistoryRaw = await this.createQueryBuilder('reviewHistory')
      .select("TO_CHAR(reviewHistory.dateReviewed, 'YYYY-MM-DD')", 'date')
      .addSelect('reviewHistory.performanceRating')
      .addSelect('COUNT(*)', 'count')
      .where('reviewHistory.user = :userId', { userId: user.id })
      .andWhere('reviewHistory.dateReviewed >= :thirtyDaysAgo', {
        thirtyDaysAgo: thirtyDaysAgo.toISOString().split('T')[0],
      })
      .groupBy("TO_CHAR(reviewHistory.dateReviewed, 'YYYY-MM-DD')")
      .addGroupBy('reviewHistory.performanceRating')
      .orderBy('date')
      .getRawMany();

    // Initialize all days with zero counts for each rating
    const reviewHistoryData = {};
    for (let i = 0; i <= 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setUTCDate(date.getUTCDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      reviewHistoryData[formattedDate] = {
        again: 0,
        hard: 0,
        good: 0,
        easy: 0,
      };
    }

    // Fill in counts from database query
    reviewHistoryRaw.forEach((item) => {
      const dateKey = item.date;
      const rating = item.reviewHistory_performanceRating.toLowerCase();
      if (reviewHistoryData[dateKey] && rating in reviewHistoryData[dateKey]) {
        reviewHistoryData[dateKey][rating] += parseInt(item.count, 10);
      }
    });

    // Convert to array format
    return Object.entries(reviewHistoryData).map(([date, ratings]: any) => {
      const utcDate = new Date(date);
      const formattedDate = utcDate.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
      });

      return {
        date: formattedDate,
        ...ratings,
      };
    });
  }

  async findReviewHistoryLastYear(user: User) {
    const oneYearAgo = new Date();
    oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
    oneYearAgo.setUTCHours(0, 0, 0, 0);

    const reviewHistoryRaw = await this.createQueryBuilder('reviewHistory')
      .select('reviewHistory.dateReviewed')
      .addSelect('COUNT(*)', 'count')
      .where('reviewHistory.user = :userId', { userId: user.id })
      .andWhere('reviewHistory.dateReviewed >= :oneYearAgo', { oneYearAgo })
      .groupBy('reviewHistory.dateReviewed')
      .orderBy('reviewHistory.dateReviewed')
      .getRawMany();

    // Initialize data for all days with zero counts
    const reviewHistoryData = {};
    for (let i = 0; i < 366; i++) {
      const date = new Date(oneYearAgo);
      date.setUTCDate(date.getUTCDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      reviewHistoryData[formattedDate] = 0;
    }

    // Fill in counts from database query
    reviewHistoryRaw.forEach((item) => {
      const dateKey = new Date(item.reviewHistory_dateReviewed)
        .toISOString()
        .split('T')[0];
      reviewHistoryData[dateKey] = parseInt(item.count, 10);
    });

    // Convert to array format
    return Object.entries(reviewHistoryData).map(([date, count]) => ({
      date,
      count,
    }));
  }
}

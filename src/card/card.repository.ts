import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Flashcard } from './entities/card.entity'; // Make sure to import your actual Card entity
import { FlashcardReviewDTO } from './dto/card-review.dto';
import { User } from 'src/users/entities/user.entity';
import { PerformanceRating } from './enums/performance-rating.enum';
import { ReviewHistoryRepository } from 'src/review-history/review-history.repository';
import { Channel } from 'src/channels/entities/channel.entity';

@Injectable()
export class CardRepository extends Repository<Flashcard> {
  constructor(
    private dataSource: DataSource,
    private reviewHistoryRepository: ReviewHistoryRepository,
  ) {
    super(Flashcard, dataSource.createEntityManager());
  }

  // Create a new card
  createCard(createCardDto: any) {
    const card = this.create(createCardDto);
    return this.save(card);
  }

  // Find all cards
  async findAll(): Promise<Flashcard[]> {
    return await this.find();
  }

  async getCardsDueForChannel(user: User, channel: Channel): Promise<number> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const count = await this.createQueryBuilder('card')
      .leftJoinAndSelect('card.channel', 'channel')
      .where('card.user = :userId', { userId: user.id })
      .andWhere('channel.uuid = :channelId', { channelId: channel.uuid })
      .andWhere('card.nextReviewDate <= :today', {
        today: today.toISOString().split('T')[0],
      })
      .getCount();

    return count;
  }

  async reviewMultipleFlashcards(reviews: FlashcardReviewDTO[], user: User) {
    const results = [];

    for (const review of reviews) {
      const flashcard = await this.findOne({
        where: { uuid: review.uuid, user: { id: user.id } },
      });

      if (flashcard) {
        // Check if this is the first review of the flashcard
        if (flashcard.repetitions === 0) {
          flashcard.interval = 1; // First review interval is 1 day
          flashcard.easeFactor = 2.5; // Starting ease factor
        } else {
          // Adjust ease factor based on performance rating
          if (review.performanceRating === PerformanceRating.EASY) {
            flashcard.easeFactor += 0.1;
          } else if (review.performanceRating === PerformanceRating.HARD) {
            flashcard.easeFactor -= 0.2;
            // Ensure ease factor doesn't fall below 1.3, which is the minimum in SM-2
            flashcard.easeFactor = Math.max(1.3, flashcard.easeFactor);
          }

          // Calculate next interval
          if (review.performanceRating === PerformanceRating.AGAIN) {
            flashcard.interval = 1; // Reset interval if the card was forgotten
          } else {
            // Increase interval for next review (SM-2 formula)
            flashcard.interval = Math.round(
              flashcard.interval * flashcard.easeFactor,
            );
          }
        }

        // Create and save a new ReviewHistory entry
        const newReviewHistory = this.reviewHistoryRepository.create({
          flashcard,
          dateReviewed: new Date(),
          performanceRating: review.performanceRating,
          user,
        });

        await this.reviewHistoryRepository.save(newReviewHistory); // Save the new ReviewHistory

        // Calculate next review date
        const nextReviewDate = new Date();
        nextReviewDate.setUTCHours(0, 0, 0, 0); // Set to start of day in UTC
        nextReviewDate.setUTCDate(
          nextReviewDate.getUTCDate() + flashcard.interval,
        );

        flashcard.nextReviewDate = nextReviewDate;
        flashcard.repetitions += 1;

        await this.save(flashcard);
        results.push({ uuid: flashcard.uuid, status: 'reviewed' });
      } else {
        results.push({ uuid: review.uuid, status: 'not found' });
      }
    }

    return results;
  }

  async getDueFlashcardsCategorizedNext30Days(user: User) {
    // Set 'today' to the start of the current day in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Calculate the date for 30 days later in UTC
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setUTCDate(thirtyDaysLater.getUTCDate() + 30);

    const dueFlashcards = await this.createQueryBuilder('flashcard')
      .where('flashcard.user = :userId', { userId: user.id })
      .andWhere('flashcard.nextReviewDate >= :today', {
        today: today.toISOString().split('T')[0],
      })
      .andWhere('flashcard.nextReviewDate < :thirtyDaysLater', {
        thirtyDaysLater: thirtyDaysLater.toISOString().split('T')[0],
      })
      .getMany();

    // Initialize all days with zero counts for each category
    const categorizedData = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + i);
      const formattedDate = date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

      categorizedData[formattedDate] = { new: 0, young: 0, mature: 0 };
    }

    // Categorize and count flashcards
    dueFlashcards.forEach((flashcard) => {
      const category = this.determineCardCategory(flashcard);
      const reviewDate = new Date(flashcard.nextReviewDate)
        .toISOString()
        .split('T')[0];
      if (categorizedData[reviewDate]) {
        categorizedData[reviewDate][category]++;
      }
    });

    // Convert to array format
    return Object.entries(categorizedData).map(([date, counts]: any) => {
      // Convert the UTC date string back to a Date object
      const utcDate = new Date(date);

      // Format the date using UTC values
      const formattedDate = utcDate.toLocaleDateString('en-US', {
        timeZone: 'UTC', // Explicitly set the timeZone to UTC
        month: 'short',
        day: 'numeric',
      });

      return {
        date: formattedDate,
        ...counts,
      };
    });
  }

  async getCardMaturityStats(user: User): Promise<any[]> {
    const allUserFlashcards = await this.find({
      where: { user: { id: user.id } },
    });

    const maturityStats = { new: 0, young: 0, mature: 0 };

    allUserFlashcards.forEach((flashcard) => {
      const category = this.determineCardCategory(flashcard);
      maturityStats[category]++;
    });

    return Object.entries(maturityStats).map(([name, count]) => ({
      name,
      count,
    }));
  }

  private determineCardCategory(flashcard: Flashcard): string {
    const ageInDays =
      (new Date().getTime() - new Date(flashcard.createdAt).getTime()) /
      (1000 * 3600 * 24);
    const repetitions = flashcard.repetitions;

    if (repetitions === 0 || ageInDays < 7) {
      return 'new';
    } else if (repetitions < 5) {
      return 'young';
    } else {
      return 'mature';
    }
  }

  async getAddedFlashcardsLast30Days(user: User) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const addedFlashcardsRaw = await this.createQueryBuilder('flashcard')
      .select("TO_CHAR(flashcard.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('flashcard.user = :userId', { userId: user.id })
      .andWhere('flashcard.createdAt >= :thirtyDaysAgo', {
        thirtyDaysAgo: thirtyDaysAgo.toISOString().split('T')[0],
      })
      .groupBy("TO_CHAR(flashcard.createdAt, 'YYYY-MM-DD')")
      .orderBy('date')
      .getRawMany();

    // Initialize all days with zero counts
    const addedFlashcards = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setUTCDate(date.getUTCDate() + i);
      const formattedDate = date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
      addedFlashcards[formattedDate] = 0;
    }

    // Fill in counts from database query
    addedFlashcardsRaw.forEach((item) => {
      const dateKey = item.date; // Use the date string directly
      addedFlashcards[dateKey] = parseInt(item.count, 10);
    });

    // Convert to array format
    return Object.entries(addedFlashcards).map(([date, count]) => {
      // Convert the UTC date string back to a Date object
      const utcDate = new Date(date + 'T00:00:00Z'); // Ensure correct parsing as UTC date

      // Format the date using UTC values
      const formattedDate = utcDate.toLocaleDateString('en-US', {
        timeZone: 'UTC', // Explicitly set the timeZone to UTC
        month: 'short',
        day: 'numeric',
      });

      return {
        date: formattedDate,
        count,
      };
    });
  }

  // Find a specific card by ID
  async findOneById(uuid: string): Promise<Flashcard> {
    const card = await this.findOne({ where: { uuid } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    return card;
  }

  // Update a specific card by ID
  async updateCard(uuid: string, updateCardDto: any): Promise<Flashcard> {
    const result = await this.update(uuid, updateCardDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    return await this.findOne({ where: { uuid } });
  }

  // Remove a specific card by ID
  async removeCard(id: number): Promise<void> {
    const result = await this.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
  }
}

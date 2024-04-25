import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { FlashcardReviewDTO } from './dto/card-review.dto';
import { User } from 'src/users/entities/user.entity';
import { PerformanceRating } from './enums/performance-rating.enum';
import { ReviewHistoryRepository } from 'src/review-history/review-history.repository';
import { Channel } from 'src/channels/entities/channel.entity';
import { ChannelCardCountDto } from './dto/channel-card-count.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { CardStatDto } from './dto/card-stat.dto';
import { CardMaturityStatDto } from './dto/card-maturity-stat-dto';

@Injectable()
export class CardRepository extends Repository<Card> {
  constructor(
    private dataSource: DataSource,
    private reviewHistoryRepository: ReviewHistoryRepository,
  ) {
    super(Card, dataSource.createEntityManager());
  }

  createCard(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.create(createCardDto);
    return this.save(card);
  }

  async getCountOfCardsDueForChannel(
    user: User,
    channel: Channel,
  ): Promise<number> {
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

  findCardsDueForChannel(userId: string, channelId: string): Promise<Card[]> {
    return this.createQueryBuilder('card')
      .innerJoinAndSelect('card.cardVariant', 'cardVariant')
      .leftJoinAndSelect('card.channel', 'channel')
      .leftJoinAndSelect('card.user', 'user')
      .leftJoinAndSelect('cardVariant.frontFields', 'frontFields')
      .innerJoinAndSelect('card.note', 'note')
      .leftJoinAndSelect('note.fieldValues', 'fieldValues')
      .leftJoinAndSelect('fieldValues.field', 'field')
      .where('user.uuid = :userId', { userId })
      .andWhere('channel.uuid = :channelId', { channelId })
      .getMany();
  }

  async getCountOfCardsDueByChannel(
    user: User,
    workspaceId: string,
  ): Promise<ChannelCardCountDto[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const counts = await this.createQueryBuilder('card')
      .leftJoin('card.channel', 'channel')
      .leftJoin('card.workspace', 'workspace')
      .select('channel.uuid', 'channelId')
      .addSelect('COUNT(card.id)', 'count')
      .where('card.user = :userId', { userId: user.id })
      .andWhere('workspace.uuid = :workspaceId', { workspaceId: workspaceId })
      .andWhere('card.nextReviewDate <= :today', {
        today: today.toISOString().split('T')[0],
      })
      .groupBy('channel.uuid')
      .getRawMany();

    return counts.map((item) => ({
      channelId: item.channelId,
      count: parseInt(item.count, 10),
    }));
  }

  findFlashcardsByUser(userId: string, channelId: string): Promise<Card[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return this.createQueryBuilder('card')
      .innerJoinAndSelect('card.cardVariant', 'cardVariant')
      .leftJoinAndSelect('card.channel', 'channel')
      .leftJoinAndSelect('cardVariant.frontFields', 'frontFields')
      .leftJoinAndSelect('cardVariant.backFields', 'backFields')
      .innerJoinAndSelect('card.note', 'note')
      .leftJoinAndSelect('note.fieldValues', 'fieldValues')
      .leftJoinAndSelect('fieldValues.field', 'field')
      .leftJoinAndSelect('fieldValues.user', 'user')
      .where('user.uuid = :userId', { userId })
      .andWhere('channel.uuid = :channelId', { channelId })
      .andWhere('card.nextReviewDate <= :today', {
        today: today.toISOString().split('T')[0],
      })
      .getMany();
  }

  async reviewMultipleFlashcards(
    reviews: FlashcardReviewDTO[],
    user: User,
  ): Promise<FlashcardReviewDTO[]> {
    const results = [];

    for (const review of reviews) {
      const flashcard = await this.findOne({
        where: { uuid: review.uuid, user: { id: user.id } },
      });

      if (flashcard) {
        if (flashcard.repetitions === 0) {
          flashcard.interval = 1;
          flashcard.easeFactor = 2.5;
        } else {
          if (review.performanceRating === PerformanceRating.EASY) {
            flashcard.easeFactor += 0.1;
          } else if (review.performanceRating === PerformanceRating.HARD) {
            flashcard.easeFactor -= 0.2;
            flashcard.easeFactor = Math.max(1.3, flashcard.easeFactor);
          }

          if (review.performanceRating === PerformanceRating.AGAIN) {
            flashcard.interval = 1;
          } else {
            flashcard.interval = Math.round(
              flashcard.interval * flashcard.easeFactor,
            );
          }
        }

        const newReviewHistory = this.reviewHistoryRepository.create({
          flashcard,
          dateReviewed: new Date(),
          performanceRating: review.performanceRating,
          user,
        });

        await this.reviewHistoryRepository.save(newReviewHistory);

        const nextReviewDate = new Date();
        nextReviewDate.setUTCHours(0, 0, 0, 0);
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

  async getDueFlashcardsCategorizedNext30Days(
    user: User,
  ): Promise<CardStatDto[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

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

    const categorizedData = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + i);
      const formattedDate = date.toISOString().split('T')[0];

      categorizedData[formattedDate] = { new: 0, young: 0, mature: 0 };
    }

    dueFlashcards.forEach((flashcard) => {
      const category = this.determineCardCategory(flashcard);
      const reviewDate = new Date(flashcard.nextReviewDate)
        .toISOString()
        .split('T')[0];
      if (categorizedData[reviewDate]) {
        categorizedData[reviewDate][category]++;
      }
    });

    return Object.entries(categorizedData).map(([date, counts]: any) => {
      const utcDate = new Date(date);

      const formattedDate = utcDate.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
      });

      return {
        date: formattedDate,
        ...counts,
      };
    });
  }

  async getCardMaturityStats(user: User): Promise<CardMaturityStatDto[]> {
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

  private determineCardCategory(flashcard: Card): string {
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

  async getAddedFlashcardsLast30Days(user: User): Promise<CardStatDto[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);
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

    const addedFlashcards = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setUTCDate(date.getUTCDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      addedFlashcards[formattedDate] = 0;
    }

    addedFlashcardsRaw.forEach((item) => {
      const dateKey = item.date;
      addedFlashcards[dateKey] = parseInt(item.count, 10);
    });

    return Object.entries(addedFlashcards).map(
      ([date, count]: [date: string, count: number]) => {
        const utcDate = new Date(date + 'T00:00:00Z');

        const formattedDate = utcDate.toLocaleDateString('en-US', {
          timeZone: 'UTC',
          month: 'short',
          day: 'numeric',
        });

        return {
          date: formattedDate,
          count,
        };
      },
    );
  }

  async findOneById(uuid: string): Promise<Card> {
    const card = await this.findOne({ where: { uuid } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    return card;
  }

  async updateCard(uuid: string, updateCardDto: any): Promise<Card> {
    const result = await this.update(uuid, updateCardDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    return await this.findOne({ where: { uuid } });
  }

  async removeCard(id: number): Promise<void> {
    const result = await this.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardRepository } from './card.repository'; // assuming you have a similar repository for Cards
import { User } from 'src/users/entities/user.entity';
import { Field } from 'src/card-field/entities/card-field.entity';
import { FieldValue } from 'src/card-field-value/entities/card-field-value.entity';
import { Flashcard } from './entities/card.entity';
import { FlashcardDTO } from './dto/card.dto';
import { FlashcardReviewDTO } from './dto/card-review.dto';
import { ChannelsRepository } from 'src/channels/channels.repository';

@Injectable()
export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly channelsRepository: ChannelsRepository,
  ) {}

  async create(createCardDto: CreateCardDto) {
    const card = this.cardRepository.create(createCardDto);
    await this.cardRepository.save(card);
    return card;
  }

  async findAllByUser(user: User, channelId: string) {
    // Get today's date without time for comparison
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const channel = await this.channelsRepository.findByUuid(channelId);

    const flashcards = await this.cardRepository
      .createQueryBuilder('card')
      .innerJoinAndSelect('card.cardType', 'cardType')
      .leftJoinAndSelect('card.channel', 'channel')
      .leftJoinAndSelect('cardType.frontFields', 'frontFields')
      .leftJoinAndSelect('cardType.backFields', 'backFields')
      .innerJoinAndSelect('card.note', 'note')
      .leftJoinAndSelect('note.fieldValues', 'fieldValues')
      .leftJoinAndSelect('fieldValues.field', 'field')
      .where('card.user = :userId', { userId: user.id })
      .andWhere('channel.uuid = :channelId', { channelId: channel.uuid })
      .andWhere('card.nextReviewDate <= :today', {
        today: today.toISOString().split('T')[0],
      })
      .getMany();

    return flashcards.map((card) => this.toDTO(card));
  }

  async getCardsByChannel(user: User, channelId: string) {
    const channel = await this.channelsRepository.findByUuid(channelId);

    const flashcards = await this.cardRepository
      .createQueryBuilder('card')
      .innerJoinAndSelect('card.cardType', 'cardType')
      .leftJoinAndSelect('card.channel', 'channel')
      .leftJoinAndSelect('card.user', 'user')
      .leftJoinAndSelect('cardType.frontFields', 'frontFields')
      .innerJoinAndSelect('card.note', 'note')
      .leftJoinAndSelect('note.fieldValues', 'fieldValues')
      .leftJoinAndSelect('fieldValues.field', 'field')
      .where('card.user = :userId', { userId: user.id })
      .andWhere('channel.uuid = :channelId', { channelId: channel.uuid })
      .getMany();

    return flashcards.map((flashcard: Flashcard) => ({
      uuid: flashcard.uuid,
      userId: flashcard.user.uuid,
      content: flashcard.note.fieldValues[0].content,
      nextReviewDate: flashcard.nextReviewDate,
      repetitions: flashcard.repetitions,
      createdOn: flashcard.createdAt,
    }));
  }

  async getCardsDueForChannel(user: User, channelId: string) {
    const channel = await this.channelsRepository.findByUuid(channelId);

    return await this.cardRepository.getCardsDueForChannel(user, channel);
  }

  async reviewMultipleFlashcards(reviews: FlashcardReviewDTO[], user: User) {
    return this.cardRepository.reviewMultipleFlashcards(reviews, user);
  }

  getCardsDueForWorkspace(user: User, workspaceId: string) {
    return this.cardRepository.getCardsDueForWorkspace(user, workspaceId);
  }

  getDueFlashcardsNext30Days(user: User) {
    return this.cardRepository.getDueFlashcardsCategorizedNext30Days(user);
  }

  getAddedFlashcardsLast30Days(user: User) {
    return this.cardRepository.getAddedFlashcardsLast30Days(user);
  }

  getCardMaturityStats(user: User) {
    return this.cardRepository.getCardMaturityStats(user);
  }

  async findOne(uuid: string) {
    const card = await this.cardRepository.findOne({ where: { uuid } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    return card;
  }

  async update(uuid: string, updateCardDto: UpdateCardDto) {
    const result = await this.cardRepository.update(uuid, updateCardDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    return await this.cardRepository.findOne({ where: { uuid } });
  }

  async remove(uuid: string) {
    const result = await this.cardRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID $uuidd} not found`);
    }
    return { uuid };
  }

  private toDTO(card: Flashcard): FlashcardDTO {
    return {
      uuid: card.uuid,
      front: this.extractFields(
        card.cardType.frontFields,
        card.note.fieldValues,
      ),
      back: this.extractFields(card.cardType.backFields, card.note.fieldValues),
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
      nextReviewDate: card.nextReviewDate,
    };
  }

  private extractFields(fields: Field[], fieldValues: FieldValue[]): string[] {
    // Implement logic to extract and order the fields from fieldValues based on fields
    // This might involve finding the matching fieldValues for each field and formatting the content

    return fields.map((field) => {
      // Find the corresponding fieldValue
      const fieldValue = fieldValues.find((fv) => fv.field.id === field.id);
      return fieldValue ? fieldValue.content : 'Field Missing'; // Replace with appropriate default or error handling
    });
  }
}

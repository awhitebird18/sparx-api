import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardRepository } from './card.repository';
import { User } from 'src/users/entities/user.entity';
import { Field } from 'src/card-field/entities/card-field.entity';
import { FieldValue } from 'src/card-field-value/entities/card-field-value.entity';
import { Card } from './entities/card.entity';
import { CardDto } from './dto/card.dto';
import { FlashcardReviewDTO } from './dto/card-review.dto';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { plainToInstance } from 'class-transformer';
import { AssistantService } from 'src/assistant/assistant.service';
import { NotesRepository } from 'src/notes/notes.repository';
import { FlashcardIdea } from 'src/assistant/dto/flashcard-idea.dto';
import { CardMaturityStatDto } from './dto/card-maturity-stat-dto';
import { CardStatDto } from './dto/card-stat.dto';
import { ChannelCardCountDto } from './dto/channel-card-count.dto';

@Injectable()
export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly channelsRepository: ChannelsRepository,
    private readonly assistantService: AssistantService,
    private readonly notesRepository: NotesRepository,
  ) {}

  convertToDto(card: Card): CardDto {
    const cardDto = plainToInstance(CardDto, {
      uuid: card.uuid,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      frontValues: this.extractFields(
        card.cardVariant.frontFields,
        card.note.fieldValues,
      ),
      backValues: this.extractFields(
        card.cardVariant.backFields,
        card.note.fieldValues,
      ),
      createdBy: card.user?.uuid,
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
      nextReviewDate: card.nextReviewDate,
    });

    return cardDto;
  }

  private extractFields(fields: Field[], fieldValues: FieldValue[]): string[] {
    return fields.map((field) => {
      const fieldValue = fieldValues.find((fv) => fv.field.id === field.id);
      return fieldValue ? fieldValue.content : 'Field Missing';
    });
  }

  async generateFlashcardIdeas({
    noteId,
    channelId,
  }: {
    noteId: string;
    channelId: string;
  }): Promise<FlashcardIdea[]> {
    const channel = await this.channelsRepository.findOne({
      where: { uuid: channelId },
      relations: ['workspace'],
    });
    const workspace = channel.workspace;

    const note = await this.notesRepository.findByUuid(noteId);

    return this.assistantService.generateFlashcardIdeas(
      note,
      channel,
      workspace,
    );
  }

  async create(createCardDto: CreateCardDto): Promise<CardDto> {
    const card = await this.cardRepository.createCard(createCardDto);

    return this.convertToDto(card);
  }

  async findAllByUser(user: User, channelId: string): Promise<CardDto[]> {
    const channel = await this.channelsRepository.findByUuid(channelId);

    const flashcards = await this.cardRepository.findFlashcardsByUser(
      user.uuid,
      channel.uuid,
    );

    return flashcards.map((card) => this.convertToDto(card));
  }

  async getCardsDueForChannel(
    user: User,
    channelId: string,
  ): Promise<CardDto[]> {
    const channel = await this.channelsRepository.findByUuid(channelId);

    const flashcards = await this.cardRepository.findCardsDueForChannel(
      user.uuid,
      channel.uuid,
    );

    return flashcards.map((card: Card) => this.convertToDto(card));
  }

  async getCardCountsDueForChannel(
    user: User,
    channelId: string,
  ): Promise<number> {
    const channel = await this.channelsRepository.findByUuid(channelId);

    return await this.cardRepository.getCountOfCardsDueForChannel(
      user,
      channel,
    );
  }

  async reviewMultipleFlashcards(
    reviews: FlashcardReviewDTO[],
    user: User,
  ): Promise<FlashcardReviewDTO[]> {
    return this.cardRepository.reviewMultipleFlashcards(reviews, user);
  }

  getCountOfCardsDueByChannel(
    user: User,
    workspaceId: string,
  ): Promise<ChannelCardCountDto[]> {
    return this.cardRepository.getCountOfCardsDueByChannel(user, workspaceId);
  }

  getDueFlashcardsNext30Days(user: User): Promise<CardStatDto[]> {
    return this.cardRepository.getDueFlashcardsCategorizedNext30Days(user);
  }

  getAddedFlashcardsLast30Days(user: User): Promise<CardStatDto[]> {
    return this.cardRepository.getAddedFlashcardsLast30Days(user);
  }

  getCardMaturityStats(user: User): Promise<CardMaturityStatDto[]> {
    return this.cardRepository.getCardMaturityStats(user);
  }

  async findOne(uuid: string): Promise<CardDto> {
    const card = await this.cardRepository.findOne({ where: { uuid } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    return this.convertToDto(card);
  }

  async update(uuid: string, updateCardDto: UpdateCardDto): Promise<CardDto> {
    const result = await this.cardRepository.update(uuid, updateCardDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    const card = await this.cardRepository.findOne({ where: { uuid } });

    return this.convertToDto(card);
  }

  async remove(uuid: string): Promise<{ uuid: string }> {
    const result = await this.cardRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID $uuidd} not found`);
    }
    return { uuid };
  }
}

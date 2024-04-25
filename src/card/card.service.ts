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

@Injectable()
export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly channelsRepository: ChannelsRepository,
    private readonly assistantService: AssistantService,
    private readonly notesRepository: NotesRepository,
  ) {}

  convertToCardDto(card: Card): CardDto {
    return plainToInstance(CardDto, {
      uuid: card.uuid,
      front: this.extractFields(
        card.cardVariant.frontFields,
        card.note.fieldValues,
      ),
      back: this.extractFields(
        card.cardVariant.backFields,
        card.note.fieldValues,
      ),
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
      nextReviewDate: card.nextReviewDate,
    });
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

    return this.convertToCardDto(card);
  }

  async findAllByUser(user: User, channelId: string): Promise<CardDto[]> {
    const channel = await this.channelsRepository.findByUuid(channelId);

    const flashcards = await this.cardRepository.findFlashcardsByUser(
      user.uuid,
      channel.uuid,
    );

    return flashcards.map((card) => this.convertToCardDto(card));
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

    return flashcards.map((card: Card) => this.convertToCardDto(card));
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

  getCountOfCardsDueByChannel(user: User, workspaceId: string) {
    return this.cardRepository.getCountOfCardsDueByChannel(user, workspaceId);
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

  async update(uuid: string, updateCardDto: UpdateCardDto): Promise<CardDto> {
    const result = await this.cardRepository.update(uuid, updateCardDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID ${uuid} not found`);
    }
    const card = await this.cardRepository.findOne({ where: { uuid } });

    return this.convertToCardDto(card);
  }

  async remove(uuid: string): Promise<{ uuid: string }> {
    const result = await this.cardRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID $uuidd} not found`);
    }
    return { uuid };
  }
}

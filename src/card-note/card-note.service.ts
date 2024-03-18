import { Injectable } from '@nestjs/common';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { CreateCardNoteDto } from './dto/create-card-note.dto'; // Ensure you define this DTO
import { CardNoteRepository } from './card-note.repository';
import { CardFieldValueRepository } from 'src/card-field-value/card-field-value.repository';
import { CardFieldRepository } from 'src/card-field/card-field.repository';
import { CardRepository } from 'src/card/card.repository';
import { User } from 'src/users/entities/user.entity';
import { ChannelsRepository } from 'src/channels/channels.repository';

@Injectable()
export class CardNoteService {
  constructor(
    private channelRepository: ChannelsRepository,
    private cardRepository: CardRepository,
    private cardNoteRepository: CardNoteRepository,
    private cardFieldValueRepository: CardFieldValueRepository,
    private cardFieldRepository: CardFieldRepository,
    private cardTemplateRepository: CardTemplateRepository, // Include any other repositories you might need
  ) {}

  async create(createNoteDto: CreateCardNoteDto, user: User) {
    // Fetch the template based on templateId
    const template = await this.cardTemplateRepository.findOneOrFail({
      where: { uuid: createNoteDto.templateId },
      relations: ['cardTypes'],
    });

    const channel = await this.channelRepository.findByUuid(
      createNoteDto.channelId,
    );

    // Create a new CardNote entity
    const cardNote = this.cardNoteRepository.create({ template }); // Assuming you have a CardNote entity

    try {
      const savedCardNote = await this.cardNoteRepository.save(cardNote);
      // Then create and save FieldValue entities
      for (const fieldValue of createNoteDto.fieldValues) {
        const field = await this.cardFieldRepository.findOneOrFail({
          where: { uuid: fieldValue.uuid },
        });

        const newFieldValue = this.cardFieldValueRepository.create({
          field: field,
          content: fieldValue.value,
          note: savedCardNote, // Use the saved CardNote here
        });

        // Save the FieldValue
        await this.cardFieldValueRepository.save(newFieldValue);

        if (savedCardNote.fieldValues) {
          // Optionally add it to the savedCardNote's fieldValues collection
          savedCardNote.fieldValues.push(newFieldValue);
        } else {
          savedCardNote.fieldValues = [newFieldValue];
        }
      }

      // Create flashcards
      for (const cardType of template.cardTypes) {
        const flashcard = this.cardRepository.create({
          cardType: cardType,
          note: savedCardNote,
          user,
          channel,
          // ... set any other required fields ...
        });

        // Save the flashcard
        await this.cardRepository.save(flashcard);

        if (savedCardNote.flashcards) {
          savedCardNote.flashcards.push(flashcard);
        } else {
          savedCardNote.flashcards = [flashcard];
        }
      }
      return savedCardNote;
    } catch (error) {
      console.error(error);
    }
  }
}

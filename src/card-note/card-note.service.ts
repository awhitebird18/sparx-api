import { Injectable } from '@nestjs/common';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { CreateCardNoteDto } from './dto/create-card-note.dto';
import { CardNoteRepository } from './card-note.repository';
import { CardFieldValueRepository } from 'src/card-field-value/card-field-value.repository';
import { CardFieldRepository } from 'src/card-field/card-field.repository';
import { CardRepository } from 'src/card/card.repository';
import { User } from 'src/users/entities/user.entity';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { Card } from 'src/card/entities/card.entity';

@Injectable()
export class CardNoteService {
  constructor(
    private channelRepository: ChannelsRepository,
    private workspaceRepository: WorkspacesRepository,
    private cardRepository: CardRepository,
    private cardNoteRepository: CardNoteRepository,
    private cardFieldValueRepository: CardFieldValueRepository,
    private cardFieldRepository: CardFieldRepository,
    private cardTemplateRepository: CardTemplateRepository,
  ) {}

  async create(createNoteDto: CreateCardNoteDto, user: User): Promise<Card[]> {
    const template = await this.cardTemplateRepository.findOneOrFail({
      where: { uuid: createNoteDto.templateId },
      relations: ['cardVariants'],
    });

    const channel = await this.channelRepository.findByUuid(
      createNoteDto.channelId,
    );
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      createNoteDto.workspaceId,
    );

    const cardNote = this.cardNoteRepository.create({ template });

    try {
      const savedCardNote = await this.cardNoteRepository.save(cardNote);

      for (const fieldValue of createNoteDto.fieldValues) {
        const field = await this.cardFieldRepository.findOneOrFail({
          where: { uuid: fieldValue.uuid },
        });

        const newFieldValue = this.cardFieldValueRepository.create({
          field: field,
          content: fieldValue.value,
          note: savedCardNote,
        });

        await this.cardFieldValueRepository.save(newFieldValue);

        if (savedCardNote.fieldValues) {
          savedCardNote.fieldValues.push(newFieldValue);
        } else {
          savedCardNote.fieldValues = [newFieldValue];
        }
      }

      for (const cardVariant of template.cardVariants) {
        const flashcard = this.cardRepository.create({
          cardVariant: cardVariant,
          note: savedCardNote,
          user,
          channel,
          workspace,
        });

        await this.cardRepository.save(flashcard);

        if (savedCardNote.flashcards) {
          savedCardNote.flashcards.push(flashcard);
        } else {
          savedCardNote.flashcards = [flashcard];
        }
      }

      return savedCardNote.flashcards;
    } catch (error) {
      console.error(error);
    }
  }
}

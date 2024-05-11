import { Module, forwardRef } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { CardNoteModule } from 'src/card-note/card-note.module';
import { CardFieldModule } from 'src/card-field/card-field.module';
import { CardFieldValueModule } from 'src/card-field-value/card-field-value.module';
import { CardTemplateModule } from 'src/card-template/card-template.module';
import { CardRepository } from './card.repository';
import { ReviewHistoryModule } from 'src/review-history/review-history.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { AssistantModule } from 'src/assistant/assistant.module';
import { NotesModule } from 'src/notes/notes.module';

@Module({
  imports: [
    forwardRef(() => CardNoteModule),
    CardFieldModule,
    CardFieldValueModule,
    CardTemplateModule,
    ReviewHistoryModule,
    forwardRef(() => ChannelsModule),
    forwardRef(() => AssistantModule),
    NotesModule,
  ],
  controllers: [CardController],
  providers: [CardService, CardRepository],
  exports: [CardService, CardRepository],
})
export class CardModule {}

import { Module, forwardRef } from '@nestjs/common';
import { CardNoteService } from './card-note.service';
import { CardNoteController } from './card-note.controller';
import { CardFieldValueModule } from 'src/card-field-value/card-field-value.module';
import { CardFieldModule } from 'src/card-field/card-field.module';
import { CardTemplateModule } from 'src/card-template/card-template.module';
import { CardNoteRepository } from './card-note.repository';
import { CardModule } from 'src/card/card.module';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [
    ChannelsModule,
    CardFieldModule,
    CardFieldValueModule,
    CardTemplateModule,
    forwardRef(() => CardModule),
  ],
  controllers: [CardNoteController],
  providers: [CardNoteService, CardNoteRepository],
  exports: [CardNoteRepository],
})
export class CardNoteModule {}

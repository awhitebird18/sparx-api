import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { NotesRepository } from './notes.repository';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), ChannelsModule],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
  exports: [NotesService, NotesRepository],
})
export class NotesModule {}

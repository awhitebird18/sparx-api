import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CardNote } from './entities/card-note.entity';

@Injectable()
export class CardNoteRepository extends Repository<CardNote> {
  constructor(private dataSource: DataSource) {
    super(CardNote, dataSource.createEntityManager());
  }
}

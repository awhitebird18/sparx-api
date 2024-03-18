import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { FieldValue } from './entities/card-field-value.entity';

@Injectable()
export class CardFieldValueRepository extends Repository<FieldValue> {
  constructor(private dataSource: DataSource) {
    super(FieldValue, dataSource.createEntityManager());
  }
}

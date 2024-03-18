import { Module } from '@nestjs/common';
import { CardFieldValueService } from './card-field-value.service';
import { CardFieldValueController } from './card-field-value.controller';
import { CardFieldValueRepository } from './card-field-value.repository';

@Module({
  controllers: [CardFieldValueController],
  providers: [CardFieldValueService, CardFieldValueRepository],
  exports: [CardFieldValueRepository],
})
export class CardFieldValueModule {}

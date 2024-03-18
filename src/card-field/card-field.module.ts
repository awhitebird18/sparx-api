import { Module } from '@nestjs/common';
import { CardFieldService } from './card-field.service';
import { CardFieldController } from './card-field.controller';
import { CardFieldRepository } from './card-field.repository';
import { CardTemplateModule } from 'src/card-template/card-template.module';

@Module({
  imports: [CardTemplateModule],
  controllers: [CardFieldController],
  providers: [CardFieldService, CardFieldRepository],
  exports: [CardFieldRepository],
})
export class CardFieldModule {}

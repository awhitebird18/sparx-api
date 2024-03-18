import { Module } from '@nestjs/common';
import { CardTypeService } from './card-type.service';
import { CardTypeController } from './card-type.controller';
import { CardTemplateModule } from 'src/card-template/card-template.module';
import { CardTypeRepository } from './card-type.repository';
import { CardFieldModule } from 'src/card-field/card-field.module';

@Module({
  imports: [CardTemplateModule, CardFieldModule],
  controllers: [CardTypeController],
  providers: [CardTypeService, CardTypeRepository],
  exports: [CardTypeRepository],
})
export class CardTypeModule {}

import { Module } from '@nestjs/common';
import { CardTemplateService } from './card-template.service';
import { CardTemplateController } from './card-template.controller';
import { CardTemplateRepository } from './card-template.repository';

@Module({
  imports: [CardTemplateModule],
  controllers: [CardTemplateController],
  providers: [CardTemplateService, CardTemplateRepository],
  exports: [CardTemplateService, CardTemplateRepository],
})
export class CardTemplateModule {}

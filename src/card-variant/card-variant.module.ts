import { Module } from '@nestjs/common';
import { CardVariantService } from './card-variant.service';
import { CardVariantController } from './card-variant.controller';
import { CardTemplateModule } from 'src/card-template/card-template.module';
import { CardVariantRepository } from './card-variant.repository';
import { CardFieldModule } from 'src/card-field/card-field.module';

@Module({
  imports: [CardTemplateModule, CardFieldModule],
  controllers: [CardVariantController],
  providers: [CardVariantService, CardVariantRepository],
  exports: [CardVariantRepository],
})
export class CardVariantModule {}

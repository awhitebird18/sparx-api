import { Injectable } from '@nestjs/common';
import { CreateCardFieldDto } from './dto/create-card-field.dto';
import { CardFieldRepository } from './card-field.repository';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { UpdateCardFieldDto } from './dto/update-card-field.dto';

@Injectable()
export class CardFieldService {
  constructor(
    private cardFieldRepository: CardFieldRepository,
    private cardTemplateRepository: CardTemplateRepository,
  ) {}
  async create(createCardFieldDto: CreateCardFieldDto) {
    const template = await this.cardTemplateRepository.findByUuid(
      createCardFieldDto.templateId,
    );

    return await this.cardFieldRepository.createCardField(
      createCardFieldDto,
      template,
    );
  }

  findByTemplate(templateId: string) {
    return this.cardFieldRepository.findByTemplateId(templateId);
  }

  findByUuid(uuid: string) {
    return this.cardFieldRepository.findByUuid(uuid);
  }

  updateOne(uuid: string, updateCardFieldDto: UpdateCardFieldDto) {
    return this.cardFieldRepository.updateOne(uuid, updateCardFieldDto);
  }

  removeOne(uuid: string) {
    return this.cardFieldRepository.removeOne(uuid);
  }
}

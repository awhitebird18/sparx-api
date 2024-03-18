import { Injectable } from '@nestjs/common';

import { CardTypeRepository } from './card-type.repository';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { CreateCardTypeDto } from './dto/create-card-type.dto';
import { UpdateCardTypeDto } from './dto/update-card-type.dto';
import { CardFieldRepository } from 'src/card-field/card-field.repository';

@Injectable()
export class CardTypeService {
  constructor(
    private cardTypeRepository: CardTypeRepository,
    private cardTemplateRepository: CardTemplateRepository,
    private cardFieldRepository: CardFieldRepository,
  ) {}
  async create(createCardTypeDto: CreateCardTypeDto) {
    const template = await this.cardTemplateRepository.findByUuid(
      createCardTypeDto.templateId,
    );

    return await this.cardTypeRepository.createCardType(
      createCardTypeDto,
      template,
    );
  }

  async addField(
    cardTypeUuid: string,
    cardField: { fieldId: string; cardSide: 'front' | 'back' },
  ) {
    // Retrieve the card type by UUID
    const cardType = await this.cardTypeRepository.findOneOrFail({
      where: { uuid: cardTypeUuid },
      relations: ['frontFields', 'backFields'], // Make sure to load the relations
    });

    // Retrieve the field by UUID
    const field = await this.cardFieldRepository.findOneOrFail({
      where: { uuid: cardField.fieldId },
    });

    // Depending on the card side specified, add the field ID to the appropriate array
    if (cardField.cardSide === 'front') {
      cardType.frontFields.push(field);
    } else {
      cardType.backFields.push(field);
    }

    // Save the updated card type entity
    await this.cardTypeRepository.save(cardType);

    return cardType;
  }

  async removeField(
    cardTypeUuid: string,
    cardField: { fieldId: string; cardSide: 'front' | 'back' },
  ) {
    // Retrieve the card type by UUID
    const cardType = await this.cardTypeRepository.findOneOrFail({
      where: { uuid: cardTypeUuid },
      relations: ['frontFields', 'backFields'], // Load relations if they are not loaded by default
    });

    // Depending on the card side specified, remove the field ID from the appropriate array
    if (cardField.cardSide === 'front') {
      cardType.frontFields = cardType.frontFields.filter(
        (field) => field.uuid !== cardField.fieldId,
      );
    } else {
      cardType.backFields = cardType.backFields.filter(
        (field) => field.uuid !== cardField.fieldId,
      );
    }

    // Save the updated card type entity
    await this.cardTypeRepository.save(cardType);

    return cardType;
  }

  findByTemplate(templateId: string) {
    return this.cardTypeRepository.findByTemplateId(templateId);
  }

  findByUuid(uuid: string) {
    return this.cardTypeRepository.findByUuid(uuid);
  }

  updateOne(uuid: string, updateCardTypeDto: UpdateCardTypeDto) {
    return this.cardTypeRepository.updateOne(uuid, updateCardTypeDto);
  }

  removeOne(uuid: string) {
    return this.cardTypeRepository.removeOne(uuid);
  }
}

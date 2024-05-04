import { Injectable } from '@nestjs/common';
import { CardVariantRepository } from './card-variant.repository';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { CreateCardVariantDto } from './dto/create-card-variant.dto';
import { UpdateCardVariantDto } from './dto/update-card-variant.dto';
import { CardFieldRepository } from 'src/card-field/card-field.repository';
import { CardVariantDto } from './dto/card-variant.dto';
import { plainToInstance } from 'class-transformer';
import { CardVariant } from './entities/card-variant.entity';

@Injectable()
export class CardVariantService {
  constructor(
    private cardTypeRepository: CardVariantRepository,
    private cardTemplateRepository: CardTemplateRepository,
    private cardFieldRepository: CardFieldRepository,
  ) {}

  convertToDto(variant: CardVariant): CardVariantDto {
    return plainToInstance(CardVariantDto, variant);
  }

  async create(
    createCardVariantDto: CreateCardVariantDto,
  ): Promise<CardVariantDto> {
    const template = await this.cardTemplateRepository.findByUuid(
      createCardVariantDto.templateId,
    );

    const variant = await this.cardTypeRepository.createCardVariant(
      createCardVariantDto,
      template,
    );

    return this.convertToDto(variant);
  }

  async addField(
    cardTypeUuid: string,
    cardField: { fieldId: string; cardSide: 'front' | 'back' },
  ): Promise<CardVariantDto> {
    const cardTypeFound = await this.cardTypeRepository.findOneOrFail({
      where: { uuid: cardTypeUuid },
      relations: ['frontFields', 'backFields'],
    });

    const field = await this.cardFieldRepository.findOneOrFail({
      where: { uuid: cardField.fieldId },
    });

    if (cardField.cardSide === 'front') {
      cardTypeFound.frontFields.push(field);
    } else {
      cardTypeFound.backFields.push(field);
    }

    const variant = await this.cardTypeRepository.save(cardTypeFound);

    return this.convertToDto(variant);
  }

  async removeField(
    cardTypeUuid: string,
    cardField: { fieldId: string; cardSide: 'front' | 'back' },
  ): Promise<CardVariantDto> {
    const cardTypeFound = await this.cardTypeRepository.findOneOrFail({
      where: { uuid: cardTypeUuid },
      relations: ['frontFields', 'backFields'],
    });

    if (cardField.cardSide === 'front') {
      cardTypeFound.frontFields = cardTypeFound.frontFields.filter(
        (field) => field.uuid !== cardField.fieldId,
      );
    } else {
      cardTypeFound.backFields = cardTypeFound.backFields.filter(
        (field) => field.uuid !== cardField.fieldId,
      );
    }

    const variant = await this.cardTypeRepository.save(cardTypeFound);

    return this.convertToDto(variant);
  }

  async findByTemplate(templateId: string): Promise<CardVariantDto[]> {
    const cardVariants = await this.cardTypeRepository.findByTemplateId(
      templateId,
    );

    return cardVariants.map((variant) => this.convertToDto(variant));
  }

  async findByUuid(uuid: string): Promise<CardVariantDto> {
    const variant = await this.cardTypeRepository.findByUuid(uuid);

    return this.convertToDto(variant);
  }

  async updateOne(
    uuid: string,
    updateCardVariantDto: UpdateCardVariantDto,
  ): Promise<CardVariantDto> {
    const variant = await this.cardTypeRepository.updateOne(
      uuid,
      updateCardVariantDto,
    );

    return this.convertToDto(variant);
  }

  removeOne(uuid: string): void {
    this.cardTypeRepository.removeOne(uuid);
  }
}

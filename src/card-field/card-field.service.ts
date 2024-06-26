import { Injectable } from '@nestjs/common';
import { CreateCardFieldDto } from './dto/create-card-field.dto';
import { CardFieldRepository } from './card-field.repository';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { UpdateCardFieldDto } from './dto/update-card-field.dto';
import { CardFieldDto } from './dto/card-field.dto';
import { plainToInstance } from 'class-transformer';
import { Field } from './entities/card-field.entity';

@Injectable()
export class CardFieldService {
  constructor(
    private cardFieldRepository: CardFieldRepository,
    private cardTemplateRepository: CardTemplateRepository,
  ) {}

  convertToDto(cardField: Field): CardFieldDto {
    return plainToInstance(CardFieldDto, cardField);
  }

  async create(createCardFieldDto: CreateCardFieldDto): Promise<CardFieldDto> {
    const template = await this.cardTemplateRepository.findByUuid(
      createCardFieldDto.templateId,
    );

    const cardField = await this.cardFieldRepository.createCardField(
      createCardFieldDto,
      template,
    );

    return this.convertToDto(cardField);
  }

  async findByTemplate(templateId: string): Promise<CardFieldDto[]> {
    const cardFields = await this.cardFieldRepository.findByTemplateId(
      templateId,
    );

    return cardFields.map((cardField) => this.convertToDto(cardField));
  }

  async findByUuid(uuid: string): Promise<CardFieldDto> {
    const cardField = await this.cardFieldRepository.findByUuid(uuid);

    return this.convertToDto(cardField);
  }

  async updateOne(
    uuid: string,
    updateCardFieldDto: UpdateCardFieldDto,
  ): Promise<CardFieldDto> {
    const cardField = await this.cardFieldRepository.updateOne(
      uuid,
      updateCardFieldDto,
    );

    return this.convertToDto(cardField);
  }

  removeOne(uuid: string): void {
    this.cardFieldRepository.removeOne(uuid);
  }
}

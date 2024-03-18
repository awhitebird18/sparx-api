import { Injectable, NotFoundException } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { CardType } from './entities/card-type.entity';
import { CreateCardTypeDto } from './dto/create-card-type.dto';
import { UpdateCardTypeDto } from './dto/update-card-type.dto';
import { Template } from 'src/card-template/entities/card-template.entity';

@Injectable()
export class CardTypeRepository extends Repository<CardType> {
  constructor(private dataSource: DataSource) {
    super(CardType, dataSource.createEntityManager());
  }

  createCardType(
    createCardTypeDto: CreateCardTypeDto,
    template: Template,
  ): Promise<CardType> {
    const message = this.create({
      ...createCardTypeDto,
      template,
    });

    return this.save(message);
  }

  findByUuid(uuid: string): Promise<CardType> {
    return this.createQueryBuilder('cardType')
      .where('cardType.uuid = :uuid', { uuid })
      .getOne();
  }

  findByTemplateId(templateId: string): Promise<CardType[]> {
    return this.createQueryBuilder('cardType')
      .innerJoinAndSelect(
        'cardType.template',
        'template',
        'template.uuid = :templateId',
        { templateId },
      )
      .leftJoinAndSelect('cardType.frontFields', 'frontField') // Assuming 'frontFields' is the relation name
      .leftJoinAndSelect('cardType.backFields', 'backField') // Assuming 'backFields' is the relation name
      .getMany();
  }

  async updateOne(
    uuid: string,
    updateCardTypeDto: UpdateCardTypeDto,
  ): Promise<CardType> {
    const res = await this.update({ uuid }, updateCardTypeDto);

    if (!res.affected) {
      throw new NotFoundException(`Card type with UUID ${uuid} not found`);
    }

    return await this.findByUuid(uuid);
  }

  async removeOne(uuid: string) {
    const cardType = await this.findByUuid(uuid);
    if (cardType) {
      return await this.softRemove(cardType);
    } else {
      throw new Error(`Card type with UUID: ${uuid} not found`);
    }
  }
}

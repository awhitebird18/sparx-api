import { Injectable, NotFoundException } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { Field } from './entities/card-field.entity';
import { CreateCardFieldDto } from './dto/create-card-field.dto';
import { UpdateCardFieldDto } from './dto/update-card-field.dto';
import { Template } from 'src/card-template/entities/card-template.entity';

@Injectable()
export class CardFieldRepository extends Repository<Field> {
  constructor(private dataSource: DataSource) {
    super(Field, dataSource.createEntityManager());
  }

  createCardField(
    createCardFieldDto: CreateCardFieldDto,
    template: Template,
  ): Promise<Field> {
    const message = this.create({
      ...createCardFieldDto,
      template,
    });

    return this.save(message);
  }

  findByUuid(uuid: string): Promise<Field> {
    return this.createQueryBuilder('field')
      .where('field.uuid = :uuid', { uuid })
      .getOne();
  }

  findByTemplateId(templateId: string): Promise<Field[]> {
    return this.createQueryBuilder('field')
      .innerJoinAndSelect('field.template', 'template')
      .where('template.uuid = :uuid', { uuid: templateId })
      .getMany();
  }

  async updateOne(
    uuid: string,
    updateCardFieldDto: UpdateCardFieldDto,
  ): Promise<Field> {
    const res = await this.update({ uuid }, updateCardFieldDto);

    if (!res.affected) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    return await this.findByUuid(uuid);
  }

  async removeOne(uuid: string) {
    const cardField = await this.findByUuid(uuid);
    if (cardField) {
      return await this.softRemove(cardField);
    } else {
      throw new Error(`Card field with UUID: ${uuid} not found`);
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CardVariant } from './entities/card-variant.entity';
import { CreateCardVariantDto } from './dto/create-card-variant.dto';
import { UpdateCardVariantDto } from './dto/update-card-variant.dto';
import { Template } from 'src/card-template/entities/card-template.entity';

@Injectable()
export class CardVariantRepository extends Repository<CardVariant> {
  constructor(private dataSource: DataSource) {
    super(CardVariant, dataSource.createEntityManager());
  }

  createCardVariant(
    createCardVariantDto: CreateCardVariantDto,
    template: Template,
  ): Promise<CardVariant> {
    const message = this.create({
      ...createCardVariantDto,
      template,
    });

    return this.save(message);
  }

  findByUuid(uuid: string): Promise<CardVariant> {
    return this.createQueryBuilder('cardVariant')
      .where('cardVariant.uuid = :uuid', { uuid })
      .getOne();
  }

  findByTemplateId(templateId: string): Promise<CardVariant[]> {
    return this.createQueryBuilder('cardVariant')
      .innerJoinAndSelect(
        'cardVariant.template',
        'template',
        'template.uuid = :templateId',
        { templateId },
      )
      .leftJoinAndSelect('cardVariant.frontFields', 'frontField')
      .leftJoinAndSelect('cardVariant.backFields', 'backField')
      .getMany();
  }

  async updateOne(
    uuid: string,
    updateCardVariantDto: UpdateCardVariantDto,
  ): Promise<CardVariant> {
    const res = await this.update({ uuid }, updateCardVariantDto);

    if (!res.affected) {
      throw new NotFoundException(`Card type with UUID ${uuid} not found`);
    }

    return await this.findByUuid(uuid);
  }

  async removeOne(uuid: string) {
    const cardVariant = await this.findByUuid(uuid);
    if (cardVariant) {
      return await this.softRemove(cardVariant);
    } else {
      throw new Error(`Card type with UUID: ${uuid} not found`);
    }
  }
}

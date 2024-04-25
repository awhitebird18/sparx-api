import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Template } from './entities/card-template.entity';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CardTemplateRepository extends Repository<Template> {
  constructor(private dataSource: DataSource) {
    super(Template, dataSource.createEntityManager());
  }

  async createNote(
    createCardTemplateDto: CreateCardTemplateDto,
    user: User,
  ): Promise<Template> {
    const message = this.create({
      ...createCardTemplateDto,
      user,
    });

    return this.save(message);
  }

  findByUuid(uuid: string): Promise<Template> {
    return this.createQueryBuilder('template')
      .where('template.uuid = :uuid', { uuid })
      .getOne();
  }

  findAllByUser(user: User): Promise<Template[]> {
    return this.createQueryBuilder('template')
      .leftJoinAndSelect('template.fields', 'fields')
      .where('template.userId = :uuid', { uuid: user.id })
      .getMany();
  }

  async findAllTemplatesIncludingDefault(user: User): Promise<Template[]> {
    return this.createQueryBuilder('template')
      .leftJoinAndSelect('template.user', 'user')
      .where('template.isDefault = :isDefault', { isDefault: true })
      .orWhere('user.uuid = :uuid', { uuid: user.uuid })
      .getMany();
  }

  async updateOne(
    uuid: string,
    updateCardTemplateDto: UpdateCardTemplateDto,
  ): Promise<Template> {
    const res = await this.update({ uuid }, updateCardTemplateDto);

    if (!res.affected) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    return await this.findByUuid(uuid);
  }

  async removeCardTemplate(uuid: string): Promise<Template> {
    const cardTemplate = await this.findByUuid(uuid);
    if (cardTemplate) {
      return await this.softRemove(cardTemplate);
    } else {
      throw new Error(`Card template with UUID: ${uuid} not found`);
    }
  }
}

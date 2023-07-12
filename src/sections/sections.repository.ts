import {
  DataSource,
  DeleteResult,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto, UpdateSectionDto } from './dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SectionsRepository extends Repository<Section> {
  constructor(private dataSource: DataSource) {
    super(Section, dataSource.createEntityManager());
  }
  async createSection(createSectionDto: CreateSectionDto): Promise<Section> {
    const section = this.create(createSectionDto);
    return this.save(section);
  }

  async findUserSections(userId: string): Promise<Section[]> {
    return this.find({
      where: { user: { uuid: userId } },
      relations: ['channels'],
    });
  }

  async findDefaultSection(sectionType: string): Promise<Section> {
    return this.findOne({ where: { isSystem: true, type: sectionType } });
  }

  findOneByProperties(searchFields: FindOptionsWhere<Section>) {
    return this.findOne({
      where: searchFields,
    });
  }

  async updateSection(
    uuid: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<UpdateResult> {
    return this.update({ uuid }, updateSectionDto);
  }

  async removeSection(uuid: string): Promise<DeleteResult> {
    return this.softDelete({ uuid });
  }
}

import { DataSource, Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto, UpdateSectionDto } from './dto';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class SectionsRepository extends Repository<Section> {
  constructor(private dataSource: DataSource) {
    super(Section, dataSource.createEntityManager());
  }
  async createSection(createSectionDto: CreateSectionDto): Promise<Section> {
    const section = this.create(createSectionDto);
    return this.save(section);
  }

  async findUserSections(): Promise<Section[]> {
    return this.find();
  }

  findSection(uuid: string): Promise<Section> {
    return this.findOne({ where: { uuid } });
  }

  async updateSection(
    uuid: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const section = await this.findSection(uuid);

    if (!section) {
      throw new NotFoundException(`Section with UUID ${uuid} not found`);
    }

    // Update the fields of the Section
    Object.assign(section, updateSectionDto);

    return this.save(section);
  }

  async removeSection(uuid: string) {
    return this.softRemove({ uuid });
  }
}

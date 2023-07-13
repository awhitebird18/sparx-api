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
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SectionsRepository extends Repository<Section> {
  constructor(private dataSource: DataSource) {
    super(Section, dataSource.createEntityManager());
  }
  async createSection(
    createSectionDto: CreateSectionDto,
    user?: User,
  ): Promise<Section> {
    const section = this.create(createSectionDto);
    if (user) {
      section.user = user;
    }
    return this.save(section);
  }

  async findUserSections(userId: string): Promise<Section[]> {
    const sections = await this.createQueryBuilder('section')
      .leftJoin('section.channels', 'channels')
      .leftJoin('section.user', 'user')
      .where('user.uuid = :userId', { userId })
      .orWhere('section.isSystem = :isSystem', { isSystem: true })
      .getMany();

    return sections;
  }

  async findDefaultSection(sectionType: string): Promise<Section> {
    return this.findOne({ where: { isSystem: true, type: sectionType } });
  }

  async findDefaultSections(): Promise<Section[]> {
    return this.find({ where: { isSystem: true } });
  }

  async findOneByProperties(searchFields: FindOptionsWhere<Section>) {
    return await this.findOne({
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

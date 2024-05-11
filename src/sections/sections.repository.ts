import {
  DataSource,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SectionsRepository extends Repository<Section> {
  constructor(private dataSource: DataSource) {
    super(Section, dataSource.createEntityManager());
  }

  createSection(
    createSectionDto: CreateSectionDto,
    user: User,
    orderIndex?: number,
  ): Promise<Section> {
    const section = this.create({
      ...createSectionDto,
      orderIndex,
    });

    section.user = user;
    return this.save(section);
  }

  findHighestOrderIndex(userId: number): Promise<number> {
    return this.createQueryBuilder('section')
      .select('MAX(section.orderIndex)', 'maxOrderIndex')
      .where('section.userId = :userId', { userId })
      .getRawOne()
      .then((value) => value.maxOrderIndex);
  }

  async findUserSections(userId: number): Promise<Section[]> {
    const userSections = await this.createQueryBuilder('section')
      .where('section.userId = :userId', { userId })
      .getMany();

    return userSections;
  }

  findSectionChannelIds(sectionUuid: string): Promise<string[]> {
    return this.createQueryBuilder('section')
      .leftJoin('section.channels', 'channel')
      .select('channel.channelId')
      .where('section.uuid = :sectionUuid', { sectionUuid })
      .andWhere('channel.channelId != null')
      .getRawMany();
  }

  findSectionByUuid(uuid: string): Promise<Section> {
    return this.findOneBy({ uuid });
  }

  findSectionWithChannels(uuid: string): Promise<Section> {
    return this.createQueryBuilder('section')
      .leftJoinAndSelect('section.channels', 'channelSubscription')
      .leftJoinAndSelect('channelSubscription.channel', 'channel')
      .where('section.uuid = :uuid', { uuid })
      .getOneOrFail();
  }

  getMaxOrderIndex(userId: number): Promise<number> {
    return this.createQueryBuilder('section')
      .select('MAX(section.orderIndex)', 'max')
      .where('section.user.id = :userId', { userId })
      .getRawOne();
  }

  decrementOrderIndexes(
    userId: number,
    orderIndex: number,
  ): Promise<UpdateResult> {
    return this.createQueryBuilder('section')
      .update()
      .set({ orderIndex: () => '"orderIndex" - 1' })
      .where('"orderIndex" > :orderIndex', { orderIndex })
      .andWhere('user.id = :userId', { userId })
      .execute();
  }

  findDefaultSection(userId: number): Promise<Section> {
    return this.findOne({
      where: { isDefault: true, user: { id: userId } },
    });
  }

  findDefaultSections(userId: number): Promise<Section[]> {
    return this.find({ where: { isDefault: true, user: { id: userId } } });
  }

  findOneByUuid(uuid: string): Promise<Section> {
    return this.findOneBy({ uuid });
  }

  findOneSection(
    searchFields: FindOptionsWhere<Section>,
    relations?: string[],
  ): Promise<Section> {
    return this.findOne({
      where: searchFields,
      relations,
    });
  }

  updateSection(
    uuid: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<UpdateResult> {
    return this.update({ uuid }, updateSectionDto);
  }

  removeSection(section: Section): Promise<UpdateResult> {
    return this.softDelete({ uuid: section.uuid });
  }
}

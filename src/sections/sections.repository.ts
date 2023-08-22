import {
  DataSource,
  DeleteResult,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Injectable } from '@nestjs/common';

import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { Section } from './entities/section.entity';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsRepository extends Repository<Section> {
  constructor(private dataSource: DataSource) {
    super(Section, dataSource.createEntityManager());
  }
  async createSection(createSectionDto: CreateSectionDto): Promise<Section> {
    const section = this.create(createSectionDto);

    return this.save(section);
  }

  async findUserSections(userId: number): Promise<Section[]> {
    const sections = await this.createQueryBuilder('section')
      .leftJoin('section.channels', 'channel')
      .leftJoin('section.user', 'user')
      .addSelect('channel.uuid', 'channelId')
      .where('user.id = :userId', { userId })
      .orderBy('section.orderIndex', 'ASC')
      .getMany();

    return sections;
  }

  async findUserSection(uuid: string): Promise<Section[] | any> {
    const section = await this.createQueryBuilder('section')
      .leftJoinAndSelect('section.channels', 'channels')
      .leftJoinAndSelect('section.user', 'user')
      .where('section.uuid = :uuid', { uuid })
      .orderBy('section.orderIndex', 'ASC')
      .getOne();

    for (const channel of section.channels) {
      channel.channel = await this.createQueryBuilder()
        .relation(ChannelSubscription, 'channel')
        .of(channel)
        .loadOne();
    }

    return section;
  }

  async getMaxOrderIndex(userId: number): Promise<number> {
    const result = await this.createQueryBuilder('section')
      .select('MAX(section.orderIndex)', 'max')
      .where('section.user.id = :userId', { userId })
      .getRawOne();

    return result.max ?? 0;
  }

  async decrementOrderIndexes(
    userId: number,
    orderIndex: number,
  ): Promise<void> {
    await this.createQueryBuilder('section')
      .update()
      .set({ orderIndex: () => '"orderIndex" - 1' }) // decrement orderIndex
      .where('"orderIndex" > :orderIndex', { orderIndex }) // for sections with higher orderIndex
      .andWhere('user.id = :userId', { userId }) // for the same user
      .execute();
  }

  async findDefaultSection(
    sectionType: string,
    userId: number,
  ): Promise<Section> {
    return this.createQueryBuilder('section')
      .leftJoinAndSelect('section.user', 'user')
      .where('section.isSystem = :isSystem', { isSystem: true })
      .andWhere('section.type = :type', { type: sectionType })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  async findDefaultSections(userId: number): Promise<Section[]> {
    return this.find({ where: { isSystem: true, user: { id: userId } } });
  }

  async findOneByProperties(
    searchFields: FindOptionsWhere<Section>,
    relations?: string[],
  ) {
    return await this.findOne({
      where: searchFields,
      relations,
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

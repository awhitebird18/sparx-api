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
import { UserChannel } from 'src/userchannels/entity/userchannel.entity';

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
        .relation(UserChannel, 'channel')
        .of(channel)
        .loadOne();
    }

    return section;
  }

  async getMaxOrderIndex(user: User): Promise<number> {
    const result = await this.createQueryBuilder('section')
      .select('MAX(section.orderIndex)', 'max')
      .where('section.user = :user', { user: user.id })
      .getRawOne();

    return result.max ?? 0;
  }

  async decrementOrderIndexes(user: User, orderIndex: number): Promise<void> {
    await this.createQueryBuilder('section')
      .update()
      .set({ orderIndex: () => '"orderIndex" - 1' }) // decrement orderIndex
      .where('"orderIndex" > :orderIndex', { orderIndex }) // for sections with higher orderIndex
      .andWhere('user = :user', { user: user.id }) // for the same user
      .execute();
  }

  async findDefaultSection(
    sectionType: string,
    userId: string,
  ): Promise<Section> {
    return this.createQueryBuilder('section')
      .leftJoinAndSelect('section.user', 'user')
      .where('section.isSystem = :isSystem', { isSystem: true })
      .andWhere('section.type = :type', { type: sectionType })
      .andWhere('user.uuid = :userId', { userId })
      .getOne();
  }

  async findDefaultSections(userId: string): Promise<Section[]> {
    return this.find({ where: { isSystem: true, user: { uuid: userId } } });
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

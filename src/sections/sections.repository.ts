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
import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { SectionDto } from './dto/section.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SectionsRepository extends Repository<Section> {
  constructor(private dataSource: DataSource) {
    super(Section, dataSource.createEntityManager());
  }

  createSection(createSectionDto: CreateSectionDto): Promise<Section> {
    const section = this.create(createSectionDto);
    return this.save(section);
  }

  findHighestOrderIndex(userId: number): Promise<number> {
    return this.createQueryBuilder('section')
      .select('MAX(section.orderIndex)', 'maxOrderIndex')
      .where('section.userId = :userId', { userId })
      .getRawOne();
  }

  async findUserSections(userId: number): Promise<SectionDto[]> {
    const userSections = await this.createQueryBuilder('section')
      .leftJoinAndSelect('section.channels', 'channelSubscription')
      .leftJoinAndSelect('channelSubscription.channel', 'channel')
      .where('section.userId = :userId', { userId })
      .getMany();

    // Now, we have the sections and their associated channel subscriptions.
    // Next, let's loop through and populate the channel IDs.
    for (const section of userSections as any) {
      section.channelIds = section.channels.map((sub) => sub.channel.uuid);
      delete section.channels; // Optionally, remove the full channel subscriptions if you only want the IDs
    }

    return plainToInstance(SectionDto, userSections);
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
      .set({ orderIndex: () => '"orderIndex" - 1' }) // decrement orderIndex
      .where('"orderIndex" > :orderIndex', { orderIndex }) // for sections with higher orderIndex
      .andWhere('user.id = :userId', { userId }) // for the same user
      .execute();
  }

  findDefaultSection(
    sectionType: ChannelType,
    userId: number,
  ): Promise<Section> {
    return this.findOne({
      where: { isSystem: true, user: { id: userId }, type: sectionType },
    });
  }

  findDefaultSections(userId: number): Promise<Section[]> {
    return this.find({ where: { isSystem: true, user: { id: userId } } });
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

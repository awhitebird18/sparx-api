import { Injectable, NotFoundException } from '@nestjs/common';
import { SectionsRepository } from 'src/sections/sections.repository';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionDto } from './dto/section.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateSectionOrderDto } from './dto/update-section-order.dto';
import { User } from 'src/users/entities/user.entity';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class SectionsService {
  constructor(
    private sectionsRepository: SectionsRepository,
    private channelSubscriptionsService: ChannelSubscriptionsService,
    private readonly events: EventEmitter2,
  ) {}

  private readonly defaultSections = [
    {
      name: 'Favorites',
      orderIndex: 0,
      isDefault: true,
    },
  ];

  async mapSectionToDto(section: Section): Promise<SectionDto> {
    return plainToInstance(SectionDto, {
      ...section,
      channelIds: await this.findSectionChannelIds(section.uuid),
    });
  }

  async findOne(searchProperties: any): Promise<SectionDto> {
    const section = await this.sectionsRepository.findOneBy(searchProperties);

    return this.mapSectionToDto(section);
  }

  findSectionChannelIds(sectionUuid: string): Promise<string[]> {
    return this.sectionsRepository.findSectionChannelIds(sectionUuid);
  }

  async reorderSections(
    sectionIndexes: UpdateSectionOrderDto[],
    user: User,
  ): Promise<SectionDto[]> {
    const updatePromises = [];

    for (let i = 0; i < sectionIndexes.length; i++) {
      const updatePromise = this.sectionsRepository.updateSection(
        sectionIndexes[i].uuid,
        {
          orderIndex: sectionIndexes[i].orderIndex,
        },
      );
      updatePromises.push(updatePromise);
    }

    await Promise.all(updatePromises);

    const sections = await this.findUserSections(user.id);

    this.events.emit('websocket-event', 'userSections', sections, user.uuid);

    return sections;
  }

  async seedUserDefaultSections(user: User): Promise<void> {
    const sectionsPromises = [];
    for (let i = 0; i < this.defaultSections.length; i++) {
      const sectionPromise = this.sectionsRepository.createSection(
        {
          ...this.defaultSections[i],
        },
        user,
      );

      sectionsPromises.push(sectionPromise);
    }

    await Promise.all(sectionsPromises);
  }

  async createSection(
    createSectionDto: CreateSectionDto,
    user: User,
  ): Promise<SectionDto> {
    const lastSectionIndex =
      await this.sectionsRepository.findHighestOrderIndex(user.id);

    const newSection = await this.sectionsRepository.createSection(
      createSectionDto,
      user,
      lastSectionIndex + 1,
    );

    const section = this.mapSectionToDto(newSection);

    this.events.emit('websocket-event', 'newSection', section, user.uuid);

    return section;
  }

  async findUserSections(userId: number): Promise<SectionDto[]> {
    const sections = await this.sectionsRepository.findUserSections(userId);

    return await Promise.all(
      sections.map((section) => this.mapSectionToDto(section)),
    );
  }

  async findDefaultSection(userId: number): Promise<SectionDto> {
    const section = await this.sectionsRepository.findDefaultSection(userId);

    return this.mapSectionToDto(section);
  }

  async findDefaultSections(userId: number): Promise<SectionDto[]> {
    const sections = await this.sectionsRepository.findDefaultSections(userId);

    return await Promise.all(
      sections.map((section) => this.mapSectionToDto(section)),
    );
  }

  async updateSection(
    sectionUuid: string,
    updateSectionDto: UpdateSectionDto,
    user: User,
  ): Promise<SectionDto> {
    const updateResult = await this.sectionsRepository.updateSection(
      sectionUuid,
      updateSectionDto,
    );
    if (updateResult.affected === 0)
      throw new NotFoundException(`Section with UUID ${sectionUuid} not found`);

    const updatedSection = await this.sectionsRepository.findOneByUuid(
      sectionUuid,
    );

    const sectionDto = await this.mapSectionToDto(updatedSection);

    this.events.emit('websocket-event', 'updateSection', sectionDto, user.uuid);

    return sectionDto;
  }

  async removeSection(uuid: string, user: User): Promise<void> {
    try {
      const sectionToRemove =
        await this.sectionsRepository.findSectionWithChannels(uuid);
      const channelSubscriptions = sectionToRemove.channels;
      const userDefaultSections =
        await this.sectionsRepository.findDefaultSections(user.id);

      const updatePromises = channelSubscriptions.map(async (subscription) => {
        const defaultSection = userDefaultSections.find(
          (section) => section.isDefault,
        );
        return this.channelSubscriptionsService.updateChannelSection(
          user,
          subscription.channel.uuid,
          defaultSection.uuid,
        );
      });

      await Promise.all(updatePromises);

      await this.sectionsRepository.removeSection(sectionToRemove);

      this.events.emit('websocket-event', 'removeSection', uuid, user.uuid);
    } catch (error) {
      console.error('Error in removeSection: ', error);
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';

import { SectionsRepository } from 'src/sections/sections.repository';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';

import { Section } from './entities/section.entity';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ChannelType } from 'src/channels/enums/channel-type.enum';

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
      name: 'Direct Messages',
      type: ChannelType.DIRECT,
      orderIndex: 0,
    },
    {
      name: 'Channels',
      type: ChannelType.CHANNEL,
      orderIndex: 1,
    },
  ];

  async mapSectionToDto(section: Section): Promise<SectionDto> {
    return plainToInstance(SectionDto, {
      ...section,
      channelIds: await this.findSectionChannelIds(section.uuid),
    });
  }

  findOne(searchProperties: any): Promise<Section> {
    return this.sectionsRepository.findOneBy(searchProperties);
  }

  findSectionChannelIds(sectionUuid: string): Promise<string[]> {
    return this.sectionsRepository.findSectionChannelIds(sectionUuid);
  }

  async reorderSections(
    sectionIndexes: UpdateSectionOrderDto[],
    user: User,
  ): Promise<SectionDto[]> {
    const updatePromises = [];
    // Update section orderIndexes
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

  async seedUserDefaultSections(userId: number): Promise<void> {
    for (let i = 0; i < this.defaultSections.length; i++) {
      await this.sectionsRepository.createSection({
        ...this.defaultSections[i],
        orderIndex: i,
        isSystem: true,
        userId,
      });
    }
  }

  async createSection(
    createSectionDto: CreateSectionDto,
    user: User,
  ): Promise<Section> {
    const lastSectionIndex =
      await this.sectionsRepository.findHighestOrderIndex(user.id);

    // Create section
    const newSection = await this.sectionsRepository.createSection({
      ...createSectionDto,
      orderIndex: lastSectionIndex + 1,
      userId: user.id,
      type: ChannelType.ANY,
    });
    // Send new section over socket

    const serializedSection = plainToInstance(
      SectionDto,
      await this.mapSectionToDto(newSection),
    );

    this.events.emit(
      'websocket-event',
      'newSection',
      serializedSection,
      user.uuid,
    );

    return newSection;
  }

  async findUserSections(userId: number): Promise<SectionDto[]> {
    return this.sectionsRepository.findUserSections(userId);
  }

  findDefaultSection(
    sectionType: ChannelType,
    userId: number,
  ): Promise<Section> {
    return this.sectionsRepository.findDefaultSection(sectionType, userId);
  }

  findDefaultSections(userId: number): Promise<Section[]> {
    return this.sectionsRepository.findDefaultSections(userId);
  }

  async updateSection(
    sectionUuid: string,
    updateSectionDto: UpdateSectionDto,
    user: User,
  ): Promise<Section> {
    // Update section
    const updateResult = await this.sectionsRepository.updateSection(
      sectionUuid,
      updateSectionDto,
    );
    if (updateResult.affected === 0)
      throw new NotFoundException(`Section with UUID ${sectionUuid} not found`);

    // Find updated section
    const updatedSection = await this.sectionsRepository.findOneByUuid(
      sectionUuid,
    );

    this.events.emit(
      'websocket-event',
      'updateSection',
      updatedSection,
      user.uuid,
    );

    return updatedSection;
  }

  async removeSection(uuid: string, user: User): Promise<string> {
    try {
      const sectionToRemove =
        await this.sectionsRepository.findSectionWithChannels(uuid);
      const channelSubscriptions = sectionToRemove.channels;
      const userDefaultSections =
        await this.sectionsRepository.findDefaultSections(user.id);

      const updatePromises = channelSubscriptions.map(async (subscription) => {
        const defaultSection = userDefaultSections.find(
          (section) => section.type === subscription.channel.type,
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

      return uuid;
    } catch (error) {
      console.error('Error in removeSection: ', error);
    }
  }
}

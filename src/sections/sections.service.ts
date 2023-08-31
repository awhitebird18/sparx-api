import { Injectable, NotFoundException } from '@nestjs/common';

import { SectionsRepository } from 'src/sections/sections.repository';
import { SectionsGateway } from 'src/websockets/section.gateway';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';

import { Section } from './entities/section.entity';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ChannelType } from 'src/channels/enums/channel-type.enum';

import { SectionDto } from './dto/section.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateSectionOrderDto } from './dto/update-section-order.dto';

@Injectable()
export class SectionsService {
  constructor(
    private sectionsRepository: SectionsRepository,
    private sectionsGateway: SectionsGateway,
    private channelSubscriptionsService: ChannelSubscriptionsService,
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
    userId: number,
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

    const sections = await this.findUserSections(userId);

    this.sectionsGateway.sendUserSections(sections);

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
    userId: number,
  ): Promise<Section> {
    const lastSectionIndex =
      await this.sectionsRepository.findHighestOrderIndex(userId);

    // Create section
    const newSection = await this.sectionsRepository.createSection({
      ...createSectionDto,
      orderIndex: lastSectionIndex + 1,
      userId,
      type: ChannelType.ANY,
    });
    // Send new section over socket
    this.sectionsGateway.handleNewSectionSocket(
      plainToInstance(SectionDto, await this.mapSectionToDto(newSection)),
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

    // Send updated section over socket
    this.sectionsGateway.handleUpdateSectionSocket(updatedSection);

    return updatedSection;
  }

  async removeSection(uuid: string, userId: number): Promise<string> {
    try {
      const sectionToRemove =
        await this.sectionsRepository.findSectionWithChannels(uuid);
      const channelSubscriptions = sectionToRemove.channels;
      const userDefaultSections =
        await this.sectionsRepository.findDefaultSections(userId);

      const updatePromises = channelSubscriptions.map(async (subscription) => {
        const defaultSection = userDefaultSections.find(
          (section) => section.type === subscription.channel.type,
        );
        return this.channelSubscriptionsService.updateChannelSection(
          userId,
          subscription.channel.uuid,
          defaultSection.uuid,
        );
      });

      await Promise.all(updatePromises);

      await this.sectionsRepository.removeSection(sectionToRemove);

      this.sectionsGateway.handleRemoveSectionSocket(uuid);

      return uuid;
    } catch (error) {
      console.error('Error in removeSection: ', error);
    }
  }
}

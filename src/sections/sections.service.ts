import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { SectionsRepository } from 'src/sections/sections.repository';
import { SectionsGateway } from 'src/websockets/section.gateway';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';

import { Section } from './entities/section.entity';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ChannelType } from 'src/channels/enums/channel-type.enum';

import { SectionDto } from './dto/section.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SectionsService {
  constructor(
    private sectionsRepository: SectionsRepository,
    private sectionsGateway: SectionsGateway,
    private channelSubscriptionsService: ChannelSubscriptionsService,
  ) {}

  private readonly defaultSections = [
    {
      name: 'Channels',
      type: ChannelType.CHANNEL,
    },
    {
      name: 'Direct Messages',
      type: ChannelType.DIRECT,
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

  async seedUserDefaultSections(userId: number): Promise<void> {
    const maxOrderIndex = await this.sectionsRepository.getMaxOrderIndex(
      userId,
    );
    for (let i = 0; i < this.defaultSections.length; i++) {
      await this.sectionsRepository.createSection({
        ...this.defaultSections[i],
        orderIndex: maxOrderIndex,
        isSystem: true,
        userId,
      });
    }
  }

  async createSection(
    createSectionDto: CreateSectionDto,
    userId: number,
  ): Promise<Section> {
    // Get the new sections index
    const maxOrderIndex = await this.sectionsRepository.getMaxOrderIndex(
      userId,
    );

    // Create section
    const newSection = await this.sectionsRepository.createSection({
      ...createSectionDto,
      orderIndex: maxOrderIndex + 1,
      userId,
    });

    // Send new section over socket
    this.sectionsGateway.handleNewSectionSocket(newSection);

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

  async removeSection(uuid: string, userId: number): Promise<void> {
    // Find section
    const sectionToRemove = await this.sectionsRepository.findSectionByUuid(
      uuid,
    );
    if (!sectionToRemove)
      throw new NotFoundException(`Section with UUID ${uuid} not found`);

    // Move nests channels back to default sections
    const channelSubscriptions = sectionToRemove.channels;

    const userDefaultSections =
      await this.sectionsRepository.findDefaultSections(userId);

    for (let i = 0; i < channelSubscriptions.length; i++) {
      const defaultSection = userDefaultSections.find(
        (section: Section) =>
          section.type === channelSubscriptions[i].channel.type,
      );

      await this.channelSubscriptionsService.updateChannelSection(
        channelSubscriptions[i].userId,
        channelSubscriptions[i].channel.uuid,
        defaultSection.uuid,
      );
    }

    // Remove section
    const removedSection = await this.sectionsRepository.removeSection(
      sectionToRemove,
    );
    if (!removedSection)
      new NotFoundException('Unable to find section to remove');

    // Shift down orderIndex for remaining sections
    const updateResult = await this.sectionsRepository.decrementOrderIndexes(
      userId,
      sectionToRemove.orderIndex,
    );

    if (updateResult.affected === 0)
      throw new InternalServerErrorException(
        'An error occurred while updating sections.',
      );

    // Send socket
    this.sectionsGateway.handleRemoveSectionSocket(uuid);
  }
}

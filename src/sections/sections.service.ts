import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto, SectionDto, UpdateSectionDto } from './dto';
import { SectionsRepository } from 'src/sections/sections.repository';
import { plainToInstance } from 'class-transformer';
import { SectionType } from './enums';
import { User } from 'src/users/entities/user.entity';
import { SectionsGateway } from 'src/websockets/section.gateway';

import { Section } from './entities/section.entity';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';

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
      type: SectionType.CHANNEL,
    },
    {
      name: 'Direct Messages',
      type: SectionType.DIRECT,
    },
  ];

  async findOne(searchProperties: any) {
    return await this.sectionsRepository.findOneBy(searchProperties);
  }

  async seedUserDefaultSections(user: User) {
    const maxOrderIndex = await this.sectionsRepository.getMaxOrderIndex(user);
    for (let i = 0; i < this.defaultSections.length; i++) {
      await this.sectionsRepository.createSection(
        {
          ...this.defaultSections[i],
          orderIndex: maxOrderIndex,
          isSystem: true,
        },
        user,
      );
    }
  }

  async createSection(
    createSectionDto: CreateSectionDto,
    user: User,
  ): Promise<SectionDto> {
    const maxOrderIndex = await this.sectionsRepository.getMaxOrderIndex(user);

    const newSection = await this.sectionsRepository.createSection(
      { ...createSectionDto, orderIndex: maxOrderIndex + 1 },
      user,
    );

    const section = plainToInstance(SectionDto, newSection);

    this.sectionsGateway.handleNewSectionSocket(section);

    return section;
  }

  async findUserSections(userId: string) {
    const sections = await this.sectionsRepository.findUserSections(userId);

    return plainToInstance(SectionDto, sections);
  }

  async findDefaultSection(sectionType: string, userId: string) {
    return await this.sectionsRepository.findDefaultSection(
      sectionType,
      userId,
    );
  }

  async findDefaultSections(userId: string): Promise<SectionDto[]> {
    const section = await this.sectionsRepository.findDefaultSections(userId);

    return plainToInstance(SectionDto, section);
  }

  async updateSection(sectionId: string, updateSectionDto: UpdateSectionDto) {
    const updateResult = await this.sectionsRepository.updateSection(
      sectionId,
      updateSectionDto,
    );

    if (!updateResult.affected) {
      throw new NotFoundException(`Section with UUID ${sectionId} not found`);
    }

    const updatedSection = await this.sectionsRepository.findOneByProperties({
      uuid: sectionId,
    });

    const filteredSection = plainToInstance(SectionDto, updatedSection);

    this.sectionsGateway.handleUpdateSectionSocket(filteredSection);

    return filteredSection;
  }

  async removeSection(uuid: string, userId: string): Promise<boolean> {
    const sectionToRemove = await this.sectionsRepository.findUserSection(uuid);

    const channelSubscriptions = sectionToRemove.channels;

    const userDefaultSections =
      await this.sectionsRepository.findDefaultSections(userId);

    for (let i = 0; i < channelSubscriptions.length; i++) {
      const defaultSection = userDefaultSections.find(
        (section: Section) => section.type === 'channel',
      );

      await this.channelSubscriptionsService.updateChannelSection(
        channelSubscriptions[i].userId,
        channelSubscriptions[i].channel.uuid,
        defaultSection.uuid,
      );
    }

    if (!sectionToRemove) {
      throw new NotFoundException(`Section with UUID ${uuid} not found`);
    }

    const removeResult = await this.sectionsRepository.removeSection(uuid);
    const sectionRemoved = removeResult.affected > 0;

    if (sectionRemoved) {
      // Shift down orderIndex for remaining sections
      await this.sectionsRepository.decrementOrderIndexes(
        sectionToRemove.user,
        sectionToRemove.orderIndex,
      );
    }

    this.sectionsGateway.handleRemoveSectionSocket(uuid);

    return sectionRemoved;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto, SectionDto, UpdateSectionDto } from './dto';
import { SectionsRepository } from 'src/sections/sections.repository';
import { plainToInstance } from 'class-transformer';
import { SectionType } from './enums';
import { Section } from './entities/section.entity';

@Injectable()
export class SectionsService {
  constructor(private sectionsRepository: SectionsRepository) {}

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

  async seedSection(userId: string) {
    for (let i = 0; i < this.defaultSections.length - 1; i++) {
      await this.createSection({ ...this.defaultSections[i], userId });
    }
  }

  async createSection(createSectionDto: CreateSectionDto): Promise<SectionDto> {
    const section = await this.sectionsRepository.createSection(
      createSectionDto,
    );
    return plainToInstance(SectionDto, section);
  }

  async findUserSections(userId: string) {
    const sections = await this.sectionsRepository.findUserSections(userId);

    return plainToInstance(SectionDto, [...sections, ...this.defaultSections]);
  }

  async findDefaultSection(sectionType: string): Promise<Section> {
    return this.sectionsRepository.findDefaultSection(sectionType);
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
    return plainToInstance(SectionDto, updatedSection);
  }

  async removeSection(uuid: string): Promise<boolean> {
    const removeResult = await this.sectionsRepository.removeSection(uuid);

    // Check if any row was affected (i.e., any section was removed)
    return removeResult.affected > 0;
  }
}

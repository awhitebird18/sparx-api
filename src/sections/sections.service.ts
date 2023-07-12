import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto, SectionDto, UpdateSectionDto } from './dto';
import { SectionsRepository } from 'src/sections/sections.repository';
import { plainToInstance } from 'class-transformer';
import { SectionType } from './enums';

@Injectable()
export class SectionsService {
  constructor(private sectionsRepository: SectionsRepository) {}

  private readonly defaultSections = [
    {
      name: 'Channels',
      type: SectionType.CHANNEL,
      isSystem: true,
    },
    {
      name: 'Direct Messages',
      type: SectionType.DIRECT,
      isSystem: true,
    },
  ];

  async seedDefaultSections() {
    const sections = await this.sectionsRepository.find();

    for (let i = 0; i < sections.length - 1; i++) {
      await this.sectionsRepository.removeSection(sections[i].uuid);
    }

    for (let i = 0; i < this.defaultSections.length; i++) {
      await this.createSection(this.defaultSections[i]);
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

  async findDefaultSection(sectionType: string): Promise<SectionDto> {
    const section = await this.sectionsRepository.findDefaultSection(
      sectionType,
    );

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
    return plainToInstance(SectionDto, updatedSection);
  }

  async removeSection(uuid: string): Promise<boolean> {
    const removeResult = await this.sectionsRepository.removeSection(uuid);

    // Check if any row was affected (i.e., any section was removed)
    return removeResult.affected > 0;
  }
}

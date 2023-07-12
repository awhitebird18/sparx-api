import { Injectable } from '@nestjs/common';
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

  async updateSection(uuid: string, updateSectionDto: UpdateSectionDto) {
    const section = await this.sectionsRepository.updateSection(
      uuid,
      updateSectionDto,
    );

    return plainToInstance(SectionDto, section);
  }

  async removeSection(uuid: string): Promise<boolean> {
    const section = await this.sectionsRepository.findSection(uuid);

    if (!section) {
      return false;
    }

    await this.sectionsRepository.softRemove(section);
    return true;
  }
}

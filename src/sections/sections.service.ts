import { Injectable } from '@nestjs/common';
import { CreateSectionDto, SectionDto, UpdateSectionDto } from './dto';
import { SectionsRepository } from 'src/sections/sections.repository';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SectionsService {
  constructor(private sectionsRepository: SectionsRepository) {}

  async createSection(createSectionDto: CreateSectionDto): Promise<SectionDto> {
    const section = await this.sectionsRepository.createSection(
      createSectionDto,
    );
    return plainToInstance(SectionDto, section);
  }

  async findUserSections() {
    const sections = await this.sectionsRepository.findUserSections();

    console.log(sections);
    return plainToInstance(SectionDto, sections);
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

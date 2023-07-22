import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto, SectionDto, UpdateSectionDto } from './dto';
import { SectionsRepository } from 'src/sections/sections.repository';
import { plainToInstance } from 'class-transformer';
import { SectionType } from './enums';
import { User } from 'src/users/entities/user.entity';
import { SectionsGateway } from 'src/websockets/section.gateway';

@Injectable()
export class SectionsService {
  constructor(
    private sectionsRepository: SectionsRepository,
    private sectionsGateway: SectionsGateway,
  ) {}

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
      await this.sectionsRepository.createSection(this.defaultSections[i]);
    }
  }

  async createSection(
    createSectionDto: CreateSectionDto,
    user: User,
  ): Promise<SectionDto> {
    const newSection = await this.sectionsRepository.createSection(
      createSectionDto,
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

  async findDefaultSection(sectionType: string): Promise<SectionDto> {
    const section = await this.sectionsRepository.findDefaultSection(
      sectionType,
    );

    return plainToInstance(SectionDto, section);
  }

  async findDefaultSections(): Promise<SectionDto[]> {
    const section = await this.sectionsRepository.findDefaultSections();

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

  async removeSection(uuid: string): Promise<boolean> {
    const removeResult = await this.sectionsRepository.removeSection(uuid);
    const sectionRemoved = removeResult.affected > 0;

    if (sectionRemoved) {
      throw new NotFoundException(`Section with UUID ${uuid} not found`);
    }

    this.sectionsGateway.handleRemoveSectionSocket(uuid);

    return sectionRemoved;
  }
}

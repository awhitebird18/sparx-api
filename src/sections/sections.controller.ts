import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { SectionsService } from './sections.service';

import { User } from 'src/users/entities/user.entity';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionDto } from './dto/section.dto';

@ApiBearerAuth('access-token')
@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  async create(
    @Body() createSectionDto: CreateSectionDto,
    @GetUser() user: User,
  ): Promise<SectionDto> {
    return this.sectionsService.mapSectionToDto(
      await this.sectionsService.createSection(createSectionDto, user.id),
    );
  }

  @Get()
  findUserSections(@GetUser() user: User): Promise<SectionDto[]> {
    return this.sectionsService.findUserSections(user.id);
  }

  @Patch(':sectionId')
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionsService.updateSection(sectionId, updateSectionDto);
  }

  @Delete(':sectionId')
  async removeSection(
    @GetUser() user: User,
    @Param('sectionId') sectionId: string,
  ) {
    return await this.sectionsService.removeSection(sectionId, user.id);
  }
}

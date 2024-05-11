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
import { UpdateSectionOrderDto } from './dto/update-section-order.dto';

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
    return await this.sectionsService.createSection(createSectionDto, user);
  }

  @Get()
  findUserSections(@GetUser() user: User): Promise<SectionDto[]> {
    return this.sectionsService.findUserSections(user.id);
  }

  @Patch('reorder')
  reorderSections(
    @GetUser() user: User,
    @Body()
    sectionIndexes: UpdateSectionOrderDto[],
  ): Promise<SectionDto[]> {
    return this.sectionsService.reorderSections(sectionIndexes, user);
  }

  @Patch(':sectionId')
  updateSection(
    @GetUser() user: User,
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ): Promise<SectionDto> {
    return this.sectionsService.updateSection(
      sectionId,
      updateSectionDto,
      user,
    );
  }

  @Delete(':sectionId')
  removeSection(
    @GetUser() user: User,
    @Param('sectionId') sectionId: string,
  ): Promise<void> {
    return this.sectionsService.removeSection(sectionId, user);
  }
}

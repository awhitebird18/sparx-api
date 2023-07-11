import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/CreateSection.dto';
import { UpdateSectionDto } from './dto/UpdateSection.dto';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @ApiBody({ type: CreateSectionDto })
  @Post()
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.createSection(createSectionDto);
  }

  @Get()
  findUserSections() {
    return this.sectionsService.findUserSections();
  }

  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'UUID of the channel',
    example: 'ddb2cd52-1f80-41c4-9bf1-43d18b814488',
  })
  @ApiBody({
    description: 'Fields for updating a section',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Worst Friends' },
      },
    },
  })
  @Patch(':uuid')
  updateSection(
    @Param('uuid') uuid: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionsService.updateSection(uuid, updateSectionDto);
  }

  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'UUID of the section',
    example: 'ddb2cd52-1f80-41c4-9bf1-43d18b814488',
  })
  @Delete(':uuid')
  removeSection(@Param('uuid') uuid: string) {
    return this.sectionsService.removeSection(uuid);
  }
}

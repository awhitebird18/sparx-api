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
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@ApiBearerAuth('access-token')
@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @ApiBody({ type: CreateSectionDto })
  @Post()
  create(@Body() createSectionDto: CreateSectionDto, @GetUser() user: User) {
    return this.sectionsService.createSection(createSectionDto, user);
  }

  @Get()
  findUserSections(@GetUser() user: User) {
    return this.sectionsService.findUserSections(user.uuid);
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
  @Patch(':sectionId')
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionsService.updateSection(sectionId, updateSectionDto);
  }

  @ApiParam({
    name: 'sectionId',
    required: true,
    description: 'UUID of the section',
    example: 'ddb2cd52-1f80-41c4-9bf1-43d18b814488',
  })
  @Delete(':sectionId')
  removeSection(@GetUser() user: User, @Param('sectionId') sectionId: string) {
    return this.sectionsService.removeSection(sectionId, user.uuid);
  }
}

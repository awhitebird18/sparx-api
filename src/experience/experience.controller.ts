import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { ExperienceDto } from './dto/experience.dto';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Post()
  addExperience(
    @Body() body: { userId: string; workspaceId: string; points: number },
  ): Promise<ExperienceDto> {
    return this.experienceService.addExperience(
      body.userId,
      body.workspaceId,
      body.points,
    );
  }

  @Get('/:userId/:workspaceId')
  getUsersExperienceByWorkspace(
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ExperienceDto[]> {
    return this.experienceService.getUsersExperienceByWorkspace(
      userId,
      workspaceId,
    );
  }
}

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { Experience } from './entities/experience.entity';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Post()
  addExperience(
    @Body() body: { userId: string; workspaceId: string; points: number },
  ): Promise<Experience> {
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
  ): Promise<Experience[]> {
    return this.experienceService.getUsersExperienceByWorkspace(
      userId,
      workspaceId,
    );
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { SubtopicIdea } from './dto/suptopic-idea.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Get('generate-subtopics')
  generateSubtopics(
    @Query('channelId') channelId: string,
    @Query('workspaceId') workspaceId: string,
  ): Promise<SubtopicIdea[]> {
    return this.assistantService.generateSubtopics(channelId, workspaceId);
  }
}

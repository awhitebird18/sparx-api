import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  create(@Body() createAssistantDto: CreateAssistantDto) {
    return this.assistantService.create(createAssistantDto);
  }

  @Get()
  findAll() {
    return this.assistantService.findAll();
  }

  @Get('generate-subtopics')
  generateSubtopics(
    @Query('channelId') channelId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.assistantService.generateSubtopics(channelId, workspaceId);
  }

  @Post('generate-note')
  generateNote(
    @Query('channelId') channelId: string,
    @Query('workspaceId') workspaceId: string,
    @Body() { title }: { title },
    @GetUser() user: User,
  ) {
    return this.assistantService.generateNote(
      channelId,
      workspaceId,
      title,
      user,
    );
  }

  @Post('generate-flashcards')
  generateFlashcards(
    @Query('noteId') noteId: string,
    @Query('channelId') channelId: string,
    @Query('workspaceId') workspaceId: string,
    @GetUser() user: User,
  ) {
    return this.assistantService.generateFlashcards(
      noteId,
      channelId,
      workspaceId,
      user,
    );
  }

  @Post('summarize-article')
  summarizeArticle(
    @Query('channelId') channelId: string,
    @Query('workspaceId') workspaceId: string,
    @Body() { article }: { article: string },
    @GetUser() user: User,
  ) {
    return this.assistantService.summarizeArticle(
      channelId,
      workspaceId,
      article,
      user,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssistantDto: UpdateAssistantDto,
  ) {
    return this.assistantService.update(+id, updateAssistantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assistantService.remove(+id);
  }
}

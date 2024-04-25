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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { NoteDto } from './dto/note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  createNote(
    @Body() createNoteDto: CreateNoteDto,
    @GetUser() user: User,
  ): Promise<NoteDto> {
    return this.notesService.createNote(createNoteDto, user);
  }

  @Post('generate-note')
  generateNote(
    @Query('channelId') channelId: string,
    @Body() { title }: { title },
    @GetUser() user: User,
  ): Promise<NoteDto> {
    return this.notesService.generateNote({ channelId, title, user });
  }

  @Post('summarize-article')
  summarizeArticle(
    @Query('channelId') channelId: string,
    @Body() { article }: { article: string },
    @GetUser() user: User,
  ): Promise<NoteDto> {
    return this.notesService.summarizeArticle({ channelId, article, user });
  }

  @Get('channel/:channelUuid')
  findAllByChannel(
    @Param('channelUuid') channelUuid: string,
    @GetUser() user: User,
  ): Promise<NoteDto[]> {
    return this.notesService.findAllUserNotesByChannel(channelUuid, user);
  }

  @Get(':uuid')
  findNote(@Param('uuid') uuid: string): Promise<NoteDto> {
    return this.notesService.findNote(uuid);
  }

  @Patch(':uuid')
  updateNote(
    @Param('uuid') uuid: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<NoteDto> {
    return this.notesService.updateNote(uuid, updateNoteDto);
  }

  @Delete(':uuid')
  removeNote(@Param('uuid') uuid: string): void {
    return this.notesService.removeNote(uuid);
  }
}

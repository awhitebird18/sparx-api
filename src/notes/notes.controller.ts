import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  createNote(@Body() createNoteDto: CreateNoteDto, @GetUser() user: User) {
    return this.notesService.createNote(createNoteDto, user);
  }

  @Get('channel/:channelUuid')
  findAllByChannel(
    @Param('channelUuid') channelUuid: string,
    @GetUser() user: User,
  ) {
    return this.notesService.findAllUserNotesByChannel(channelUuid, user);
  }

  @Get('workspace/:workspaceUuid')
  findAllByWorkspace(@Param('workspaceUuid') workspaceUuid: string) {
    return this.notesService.findAllByWorkspace(workspaceUuid);
  }

  @Get(':uuid')
  findNote(@Param('uuid') uuid: string) {
    return this.notesService.findNote(uuid);
  }

  @Patch(':uuid/move')
  moveNote(
    @Param('uuid') uuid: string,
    @Body() updateNoteDto: { channelId: string },
  ) {
    return this.notesService.moveNote(uuid, updateNoteDto.channelId);
  }

  @Patch(':uuid')
  updateNote(
    @Param('uuid') uuid: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(uuid, updateNoteDto);
  }

  @Delete(':uuid')
  removeNote(@Param('uuid') uuid: string) {
    return this.notesService.removeNote(uuid);
  }
}

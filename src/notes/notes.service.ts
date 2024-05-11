import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { User } from 'src/users/entities/user.entity';
import { NoteDto } from './dto/note.dto';
import { AssistantService } from 'src/assistant/assistant.service';
import { convertStringToFlashcardContentFormat } from 'src/card/utils/convertStringToFlashcardContentFormat';
import { plainToInstance } from 'class-transformer';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    private notesRepository: NotesRepository,
    private channelsRepository: ChannelsRepository,
    private assistantService: AssistantService,
  ) {}

  private convertToNoteDto(note: Note): NoteDto {
    const noteConverted = {
      title: note.title,
      isPrivate: note.isPrivate,
      uuid: note.uuid,
      createdAt: note.createdAt,
      content: note.content,
      createdBy: note.createdBy.uuid,
      updatedAt: note.updatedAt,
    };

    return plainToInstance(NoteDto, noteConverted);
  }

  async createNote(createNoteDto: CreateNoteDto, user: User): Promise<NoteDto> {
    const channel = await this.channelsRepository.findByUuid(
      createNoteDto.channelId,
    );

    const note = await this.notesRepository.createNote(
      createNoteDto,
      channel,
      user,
    );

    return this.convertToNoteDto(note);
  }

  async generateNote({
    channelId,
    title,
    user,
  }: {
    channelId: string;
    title: string;
    user: User;
  }): Promise<NoteDto> {
    const channel = await this.channelsRepository.findOne({
      where: { uuid: channelId },
      relations: ['workspace'],
    });

    const workspace = channel.workspace;

    const noteIdea = await this.assistantService.generateNote(workspace, title);

    const noteContent = convertStringToFlashcardContentFormat(noteIdea.content);

    const noteDto = await this.createNote(
      {
        channelId: channel.uuid,
        workspaceId: workspace.uuid,
        content: noteContent,
        title: noteIdea.title,
      },
      user,
    );

    return noteDto;
  }

  async summarizeArticle({
    channelId,
    article,
    user,
  }: {
    channelId: string;
    article: string;
    user: User;
  }): Promise<NoteDto> {
    const channel = await this.channelsRepository.findOne({
      where: { uuid: channelId },
      relations: ['workspace'],
    });

    const workspace = channel.workspace;

    const noteIdea = await this.assistantService.summarizeArticle(
      channel,
      article,
    );

    const noteContent = convertStringToFlashcardContentFormat(noteIdea.content);

    const noteDto = await this.createNote(
      {
        channelId: channel.uuid,
        workspaceId: workspace.uuid,
        content: noteContent,
        title: noteIdea.title,
      },
      user,
    );

    return noteDto;
  }

  async findAllUserNotesByChannel(
    channelUuid: string,
    user: User,
  ): Promise<NoteDto[]> {
    const notes = await this.notesRepository.findAllUserNotesByChannel(
      channelUuid,
      user,
    );

    return notes.map((note) => this.convertToNoteDto(note));
  }

  async findNote(uuid: string): Promise<NoteDto> {
    const note = await this.notesRepository.findByUuid(uuid);

    return this.convertToNoteDto(note);
  }

  async updateNote(
    uuid: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<NoteDto> {
    const noteFound = await this.notesRepository.findOne({ where: { uuid } });

    if (!noteFound) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    Object.assign(noteFound, updateNoteDto);

    const note = await this.notesRepository.save(noteFound);

    return this.convertToNoteDto(note);
  }

  removeNote(uuid: string): void {
    this.notesRepository.removeNote(uuid);
  }
}

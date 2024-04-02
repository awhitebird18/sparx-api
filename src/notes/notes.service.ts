import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { User } from 'src/users/entities/user.entity';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    private notesRepository: NotesRepository,
    private channelsRepository: ChannelsRepository,
  ) {}

  async createNote(createNoteDto: CreateNoteDto, user: User) {
    const channel = await this.channelsRepository.findByUuid(
      createNoteDto.channelId,
    );

    const note = await this.notesRepository.createNote(
      createNoteDto,
      channel,
      user,
    );

    return {
      title: note.title,
      isPrivate: note.isPrivate,
      uuid: note.uuid,
      createdAt: note.createdAt,
      content: note.content,
      lastAccessed: note.updatedAt,
      // Assuming createdBy is a User entity with firstName and lastName
      createdBy: note.createdBy.uuid,
    };
  }

  async findAllUserNotesByChannel(channelUuid: string, user: User) {
    const notes = await this.notesRepository.findAllUserNotesByChannel(
      channelUuid,
      user,
    );

    // Transform the data to the desired format
    return notes.map((note) => ({
      title: note.title,
      isPrivate: note.isPrivate,
      uuid: note.uuid,
      createdAt: note.createdAt,
      // Assuming createdBy is a User entity with firstName and lastName
      createdBy: note.createdBy.uuid,
    }));
  }

  findAllByWorkspace(workspaceUuid: string) {
    return this.notesRepository.findAllByWorkspace(workspaceUuid);
  }

  async findNote(uuid: string) {
    const note = await this.notesRepository.findByUuid(uuid);

    // Transform the data to the desired format
    return {
      title: note.title,
      isPrivate: note.isPrivate,
      uuid: note.uuid,
      createdAt: note.createdAt,
      content: note.content,
      // Assuming createdBy is a User entity with firstName and lastName
      createdBy: note.createdBy.uuid,
    };
  }

  async updateNote(uuid: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.notesRepository.findOne({ where: { uuid } });

    if (!note) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    // Map the updated fields onto the note entity
    Object.assign(note, updateNoteDto);

    // The save() method will trigger the @BeforeUpdate hook
    await this.notesRepository.save(note);

    return note;
  }

  async moveNote(uuid: string, channelId: string) {
    const channel = await this.channelsRepository.findByUuid(channelId);
    const note = await this.notesRepository.updateNote(uuid, { channel });

    // Transform the data to the desired format
    return {
      title: note.title,
      isPrivate: note.isPrivate,
      uuid: note.uuid,
      createdAt: note.createdAt,
      content: note.content,
      channelId: note.channel.uuid,
      // Assuming createdBy is a User entity with firstName and lastName
      createdBy: note.createdBy.uuid,
    };
  }

  removeNote(uuid: string) {
    return this.notesRepository.removeNote(uuid);
  }
}

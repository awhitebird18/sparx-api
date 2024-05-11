import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Channel } from 'src/channels/entities/channel.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotesRepository extends Repository<Note> {
  constructor(private dataSource: DataSource) {
    super(Note, dataSource.createEntityManager());
  }

  async createNote(
    createNoteDto: Partial<Note>,
    channel: Channel,
    user: User,
  ): Promise<Note> {
    const message = this.create({
      ...createNoteDto,
      channel: { id: channel.id },
      createdBy: user,
    });

    return this.save(message);
  }

  findByUuid(uuid: string): Promise<Note> {
    return this.createQueryBuilder('note')
      .innerJoinAndSelect('note.channel', 'channel')
      .innerJoinAndSelect('note.createdBy', 'createdBy')
      .where('note.uuid = :uuid', { uuid })
      .getOne();
  }

  findAllByWorkspace(workspaceUuid: string): Promise<Note[]> {
    return this.createQueryBuilder('note')
      .innerJoinAndSelect('note.workspace', 'workspace')
      .where('workspace.uuid = :workspaceUuid', { workspaceUuid })
      .getMany();
  }

  findAllUserNotesByChannel(channelUuid: string, user: User): Promise<Note[]> {
    return this.createQueryBuilder('note')
      .innerJoinAndSelect('note.channel', 'channel')
      .innerJoinAndSelect('note.createdBy', 'createdBy')
      .where('channel.uuid = :channelUuid', { channelUuid })
      .andWhere(
        new Brackets((qb) => {
          qb.where('createdBy.uuid = :userId', { userId: user.uuid }).orWhere(
            'note.isPrivate = false',
          );
        }),
      )
      .getMany();
  }

  async updateNote(uuid: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const res = await this.update({ uuid }, updateNoteDto);

    if (!res.affected) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    return await this.findByUuid(uuid);
  }

  async removeNote(uuid: string): Promise<Note> {
    const note = await this.findByUuid(uuid);
    if (note) {
      return await this.softRemove(note);
    } else {
      throw new Error(`Note with id: ${uuid} not found`);
    }
  }
}

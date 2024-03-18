import { PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';
import { Channel } from 'src/channels/entities/channel.entity';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  channel?: Channel;
}

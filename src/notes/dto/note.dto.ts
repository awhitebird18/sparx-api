import { BaseDto } from 'src/common/dto';

export class NoteDto extends BaseDto {
  title: string;
  isPrivate: boolean;
  content: string;
  createdBy: string;
}

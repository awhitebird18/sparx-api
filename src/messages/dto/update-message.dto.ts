import { OmitType } from '@nestjs/swagger';
import { MessageDto } from './message.dto';

export class UpdateMessageDto extends OmitType(MessageDto, [
  'parentId',
  'channel',
  'reactions',
  'user',
]) {}

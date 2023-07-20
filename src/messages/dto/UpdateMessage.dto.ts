import { OmitType } from '@nestjs/swagger';
import { MessageDto } from './Message.dto';

export class UpdateMessageDto extends OmitType(MessageDto, [
  'parentId',
  'channel',
  'reactions',
  'user',
]) {}

import { PartialType } from '@nestjs/swagger';
import { MessageDto } from './Message.dto';

export class UpdateMessageDto extends PartialType(MessageDto) {}

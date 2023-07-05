import { MessageDto } from './Message.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMessageDto extends PartialType(MessageDto) {}

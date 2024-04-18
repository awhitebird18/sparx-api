import { PartialType } from '@nestjs/swagger';
import { CreateAssistantDto } from './create-assistant.dto';

export class UpdateAssistantDto extends PartialType(CreateAssistantDto) {}

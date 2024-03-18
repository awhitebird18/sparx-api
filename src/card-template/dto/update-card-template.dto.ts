import { PartialType } from '@nestjs/swagger';
import { CreateCardTemplateDto } from './create-card-template.dto';

export class UpdateCardTemplateDto extends PartialType(CreateCardTemplateDto) {}

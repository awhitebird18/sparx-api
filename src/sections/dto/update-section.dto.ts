import { PartialType } from '@nestjs/swagger';
import { SectionDto } from './section.dto';

export class UpdateSectionDto extends PartialType(SectionDto) {}

import { PartialType } from '@nestjs/swagger';
import { SectionDto } from './Section.dto';

export class UpdateSectionDto extends PartialType(SectionDto) {}

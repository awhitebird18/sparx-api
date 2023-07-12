import { PartialType } from '@nestjs/mapped-types';
import { UserChannelDto } from './UserChannel.dto';
import { Section } from 'src/sections/entities/section.entity';
import { SectionDto } from 'src/sections/dto';

export class UpdateUserChannel extends PartialType(UserChannelDto) {
  section?: SectionDto;
}

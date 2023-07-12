import { PartialType } from '@nestjs/mapped-types';
import { UserChannelDto } from './UserChannel.dto';
import { SectionDto } from 'src/sections/dto';

export class UpdateUserChannel extends PartialType(UserChannelDto) {
  section?: SectionDto;
}

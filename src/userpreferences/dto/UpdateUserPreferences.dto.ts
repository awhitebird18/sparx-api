import { PartialType } from '@nestjs/swagger';
import { UserpreferencesDto } from './UserPreferences.dto';

export class UpdateUserpreferenceDto extends PartialType(UserpreferencesDto) {}

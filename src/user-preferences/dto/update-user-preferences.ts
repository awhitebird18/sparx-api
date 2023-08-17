import { PartialType } from '@nestjs/swagger';
import { UserPreferencesDto } from './user-preferences.dto';

export class UpdateUserpreferenceDto extends PartialType(UserPreferencesDto) {}

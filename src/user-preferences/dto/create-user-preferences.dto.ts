import { PartialType } from '@nestjs/swagger';
import { UserPreferencesDto } from './user-preferences.dto';

export class CreateUserPreferenceDto extends PartialType(UserPreferencesDto) {}

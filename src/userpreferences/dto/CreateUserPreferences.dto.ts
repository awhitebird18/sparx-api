import { PartialType } from '@nestjs/swagger';
import { UserpreferencesDto } from './UserPreferences.dto';

export class CreateUserpreferenceDto extends PartialType(UserpreferencesDto) {}

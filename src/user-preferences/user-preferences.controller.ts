import { Controller, Body, Patch } from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { UserPreferencesService } from './user-preferences.service';
import { User } from 'src/users/entities/user.entity';

import { UpdateUserPreferencesDto } from './dto/update-user-preferences';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(
    private readonly userpreferencesService: UserPreferencesService,
  ) {}

  @Patch()
  update(
    @GetUser() user: User,
    @Body() updateUserpreferenceDto: UpdateUserPreferencesDto,
  ) {
    return this.userpreferencesService.update(user.id, updateUserpreferenceDto);
  }
}

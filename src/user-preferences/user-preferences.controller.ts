import { Controller, Body, Patch, Post } from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserPreferencesService } from './user-preferences.service';
import { User } from 'src/users/entities/user.entity';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences';
import { UserPreferencesDto } from './dto/user-preferences.dto';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(
    private readonly userpreferencesService: UserPreferencesService,
  ) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() updateUserpreferenceDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesDto> {
    return this.userpreferencesService.createUserPreferences(
      user,
      updateUserpreferenceDto,
    );
  }

  @Patch()
  update(
    @GetUser() user: User,
    @Body() updateUserpreferenceDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesDto> {
    return this.userpreferencesService.update(user.id, updateUserpreferenceDto);
  }
}

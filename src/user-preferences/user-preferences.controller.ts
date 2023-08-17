import { Controller, Post, Body, Patch } from '@nestjs/common';
import { UserpreferencesService } from './user-preferences.service';
import { UpdateUserpreferenceDto } from './dto/update-user-preferences';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('user-preferences')
export class UserpreferencesController {
  constructor(
    private readonly userpreferencesService: UserpreferencesService,
  ) {}

  @Post()
  create(@GetUser() user: User) {
    return this.userpreferencesService.createUserPreferences(user);
  }

  @Patch()
  update(
    @GetUser() user: User,
    @Body() updateUserpreferenceDto: UpdateUserpreferenceDto,
  ) {
    return this.userpreferencesService.update(
      user.uuid,
      updateUserpreferenceDto,
    );
  }
}

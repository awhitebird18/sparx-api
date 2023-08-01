import { Controller, Post, Body, Patch } from '@nestjs/common';
import { UserpreferencesService } from './userpreferences.service';
import { UpdateUserpreferenceDto } from './dto/UpdateUserPreferences.dto';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('userpreferences')
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

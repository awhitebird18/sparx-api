import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: RegisterDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('seed-bot')
  createBot() {
    return this.usersService.createBot();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneByEmail(id);
  }

  @Get()
  finalWorkspaceUsers() {
    return this.usersService.findWorkspaceUsers();
  }

  @Patch('self/image-upload')
  updateProfileImage(
    @GetUser() currentUser: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfileImage(
      currentUser.id,
      updateUserDto.profileImage,
    );
  }

  @Patch('self')
  update(@GetUser() currentUser: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(currentUser.id, updateUserDto);
  }

  @Delete('self')
  remove(@GetUser() currentUser: User) {
    return this.usersService.remove(currentUser.id);
  }
}

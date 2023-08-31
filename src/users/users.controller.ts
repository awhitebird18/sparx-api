import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserDto } from './dto/user.dto';

@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: RegisterDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Post('seed-bot')
  createBot(): Promise<UserDto> {
    return this.usersService.createBot();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOneByEmail(id);
  }

  @Get()
  finalWorkspaceUsers(): Promise<UserDto[]> {
    return this.usersService.findWorkspaceUsers();
  }

  @Patch('self/image-upload')
  updateProfileImage(
    @GetUser() currentUser: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.updateProfileImage(
      currentUser.id,
      updateUserDto.profileImage,
    );
  }

  @Patch('self')
  update(
    @GetUser() currentUser: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(currentUser.id, updateUserDto);
  }

  @UseGuards(RolesGuard)
  @Delete(':userUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('userUuid', new ParseUUIDPipe({ version: '4' })) userId: string,
  ): Promise<void> {
    return this.usersService.remove(userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserStatusesService } from './user-statuses.service';
import { CreateUserStatusDto } from './dto/create-user-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('user-statuses')
export class UserStatusesController {
  constructor(private readonly userStatusesService: UserStatusesService) {}

  @Post()
  createUserStatus(
    @GetUser() user: User,
    @Body() createUserStatusDto: CreateUserStatusDto,
  ) {
    return this.userStatusesService.createUserStatus(user, createUserStatusDto);
  }

  @Get()
  findAllUserStatuses(@GetUser() user: User) {
    return this.userStatusesService.findAllUserStatuses(user.id);
  }

  @Patch(':uuid')
  updateUserStatus(
    @Param('uuid') uuid: string,
    @GetUser() user: User,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.userStatusesService.updateUserStatus(
      uuid,
      updateUserStatusDto,
      user.uuid,
    );
  }

  @Delete(':uuid')
  removeUserStatus(@Param('uuid') uuid: string, @GetUser() user: User) {
    return this.userStatusesService.removeUserStatus(uuid, user);
  }
}

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './CreateUser.dto';
import { UserDto } from './User.dto';

export class UpdateUserDto extends PartialType(UserDto) {}

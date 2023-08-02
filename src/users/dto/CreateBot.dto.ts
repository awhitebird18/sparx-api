import { UserDto } from './User.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBotDto extends PartialType(UserDto) {}

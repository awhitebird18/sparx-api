import { PartialType } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto';

export class RegisterDto extends PartialType(UserDto) {}

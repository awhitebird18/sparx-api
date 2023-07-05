import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './CreateUser.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

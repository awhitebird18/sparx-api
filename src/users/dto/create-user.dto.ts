import {
  IsNotEmpty,
  MinLength,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto extends PartialType(UserDto) {
  @ApiProperty({
    example: 'Password1',
    description:
      'The password of the user. Must contain at least one lowercase, uppercase, and number.',
  })
  @IsNotEmpty()
  @IsString()
  // @MinLength(8, {
  //   message: 'Password must be at least 8 characters in length.',
  // })
  // @MaxLength(32, {
  //   message: 'Password must not be more than 32 characters in length.',
  // })
  // @Matches(/(?=.*[a-z])/, {
  //   message: 'Password must contain at least one lowercase letter.',
  // })
  // @Matches(/(?=.*[A-Z])/, {
  //   message: 'Password must contain at least one uppercase letter.',
  // })
  // @Matches(/(?=.*\d)/, {
  //   message: 'Password must contain at least one number.',
  // })
  password: string;
}

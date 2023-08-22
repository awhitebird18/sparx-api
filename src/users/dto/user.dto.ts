import { IsBoolean } from 'class-validator';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

import { BaseDto } from 'src/common/dto/base.dto';

export class UserDto extends BaseDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  profileImage: string;

  @IsBoolean()
  isVerified: boolean;

  @IsBoolean()
  isBot: boolean;

  @IsBoolean()
  isAdmin: boolean;
}

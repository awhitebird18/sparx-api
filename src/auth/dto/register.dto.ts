import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { IsPasswordMatching } from '../validators/is-password-matching';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required.' })
  @MaxLength(50, { message: 'First name is too long.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required.' })
  @MaxLength(50, { message: 'Last name is too long.' })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must contain at least one lowercase, one uppercase letter, and one number.',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsPasswordMatching({ message: 'Passwords must match.' })
  confirmPassword: string;
}

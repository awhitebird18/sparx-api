import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Users email address',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'Users password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

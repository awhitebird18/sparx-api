import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { PrimaryColor, Theme } from '../enums';
import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsString,
  MaxLength,
} from 'class-validator';
import { BaseDto } from 'src/common/dto/Base.dto';
import { SectionDto } from 'src/sections/dto';
import { UserChannelDto } from 'src/userchannels/dto/UserChannel.dto';

export class UserDto extends BaseDto {
  @ApiProperty({ example: 'John', description: 'The first name of the user.' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'The last name of the user.' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john@email.com',
    description: 'The email of the user.',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Theme, enumName: 'Theme', example: Theme.LIGHT })
  @IsEnum(Theme)
  theme: Theme;

  @ApiProperty({
    enum: PrimaryColor,
    enumName: 'PrimaryColor',
    example: PrimaryColor.BLUE,
  })
  @IsEnum(PrimaryColor)
  primaryColor: PrimaryColor;

  @IsArray()
  sections: SectionDto[];

  @IsArray()
  userChannels: UserChannelDto[];
}

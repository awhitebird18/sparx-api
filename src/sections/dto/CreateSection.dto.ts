import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({
    example: 'Channels',
    description: 'Name of the section',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'UserId of the user who created the section',
  })
  @IsUUID(4)
  userId?: string;

  @ApiProperty({
    example: true,
    description:
      'Determines if section is system of user created. All users receive system sections.',
  })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}

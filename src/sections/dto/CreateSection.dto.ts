import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
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
  @IsNotEmpty()
  @IsUUID(4)
  userId: string;
}

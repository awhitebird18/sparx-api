import { Exclude } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

export class BaseDto {
  @Exclude()
  id: number;

  @IsUUID()
  uuid?: string;

  @ApiProperty({ example: '2023-07-05T12:34:56Z' })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2023-07-05T12:34:56Z' })
  @IsOptional()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ example: '2023-07-05T12:34:56Z' })
  @IsDate()
  @IsOptional()
  deletedAt: Date;
}

import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

export class BaseDto {
  @Exclude()
  id: number;

  @IsUUID()
  uuid?: string;

  @ApiProperty({ example: '2023-07-05T12:34:56Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2023-07-05T12:34:56Z' })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ example: '2023-07-05T12:34:56Z' })
  @IsDate()
  deletedAt: Date;
}

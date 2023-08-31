import { Exclude } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';
import { IsDate } from 'class-validator';

export class BaseDto {
  @Exclude()
  @IsNumber()
  id: number;

  @IsUUID(4)
  uuid: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}

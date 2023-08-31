import { IsNumber, IsUUID } from 'class-validator';

export class UpdateSectionOrderDto {
  @IsUUID('4')
  uuid: string;

  @IsNumber()
  orderIndex: number;
}

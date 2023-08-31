import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateSectionDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNumber()
  orderIndex?: number;
}

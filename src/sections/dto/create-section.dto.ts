import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsNumber()
  userId: number;
}

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { SortBy } from '../enums/sort-by.enum';
import { BaseDto } from 'src/common/dto';

export class SectionDto extends BaseDto {
  @IsString()
  name: string;

  @IsBoolean()
  isDefault: boolean;

  @IsBoolean()
  isOpen: boolean;

  @IsOptional()
  @IsString()
  emoji?: string;

  // Todo: this should not be optional
  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsEnum(SortBy)
  sortBy: SortBy;

  @IsArray()
  channelIds: string[];

  @Exclude()
  userId: string;
}

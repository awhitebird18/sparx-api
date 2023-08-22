import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';

import { SectionType } from '../enums/section-type.enum';
import { SortBy } from '../enums/sort-by.enum';
import { BaseDto } from 'src/common/dto';

export class SectionDto extends BaseDto {
  @IsString()
  name: string;

  @IsEnum(SectionType)
  type: SectionType;

  @IsBoolean()
  isSystem: boolean;

  @IsBoolean()
  isOpen: boolean;

  @IsString()
  emoji: string;

  // Todo: this should not be optional
  @IsNumber()
  orderIndex?: number;

  @IsEnum(SortBy)
  sortBy: SortBy;

  @IsArray()
  channels: string[];
}

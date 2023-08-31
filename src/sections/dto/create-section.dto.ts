import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChannelType } from 'src/channels/enums/channel-type.enum';

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

  @IsEnum(ChannelType)
  type: ChannelType;
}

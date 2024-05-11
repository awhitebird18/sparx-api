import { PartialType } from '@nestjs/swagger';
import { CreateCardVariantDto } from './create-card-variant.dto';

export class UpdateCardVariantDto extends PartialType(CreateCardVariantDto) {}

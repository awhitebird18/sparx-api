import { PartialType } from '@nestjs/swagger';
import { CreateCardFieldDto } from './create-card-field.dto';

export class UpdateCardFieldDto extends PartialType(CreateCardFieldDto) {}

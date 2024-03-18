import { Controller } from '@nestjs/common';
import { CardFieldValueService } from './card-field-value.service';

@Controller('card-field-value')
export class CardFieldValueController {
  constructor(private readonly cardFieldValueService: CardFieldValueService) {}
}

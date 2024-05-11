import { CardFieldDto } from 'src/card-field/dto/card-field.dto';
import { BaseDto } from 'src/common/dto';

export class CardVariantDto extends BaseDto {
  title: string;
  templateId: string;
  frontFields: CardFieldDto[];
  backFields: CardFieldDto[];
}

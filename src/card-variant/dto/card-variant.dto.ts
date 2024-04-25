import { CardFieldDto } from 'src/card-field/dto/card-field.dto';

export class CardVariantDto {
  title: string;
  templateId: string;
  frontFields: CardFieldDto[];
  backFields: CardFieldDto[];
}

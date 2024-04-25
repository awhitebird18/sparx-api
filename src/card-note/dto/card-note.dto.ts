import { FieldValue } from 'src/card-field-value/entities/card-field-value.entity';
import { CardDto } from 'src/card/dto/card.dto';
import { BaseDto } from 'src/common/dto';

export class CardNoteDto extends BaseDto {
  templateId: string;
  fieldValues: FieldValue[];
  flashcards: CardDto[];
}

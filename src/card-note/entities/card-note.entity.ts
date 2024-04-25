import { FieldValue } from 'src/card-field-value/entities/card-field-value.entity';
import { Template } from 'src/card-template/entities/card-template.entity';
import { Card } from 'src/card/entities/card.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CardNote extends BaseEntity {
  @ManyToOne(() => Template, (template) => template.notes)
  template: Template;

  @OneToMany(() => FieldValue, (fieldValue) => fieldValue.note)
  fieldValues: FieldValue[];

  @OneToMany(() => Card, (flashcard) => flashcard.note)
  flashcards: Card[];
}

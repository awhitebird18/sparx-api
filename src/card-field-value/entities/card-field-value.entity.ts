import { Field } from 'src/card-field/entities/card-field.entity';
import { CardNote } from 'src/card-note/entities/card-note.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

import { Entity, ManyToOne, Column } from 'typeorm';

@Entity()
export class FieldValue extends BaseEntity {
  @ManyToOne(() => CardNote, (note) => note.fieldValues, { cascade: true })
  note: CardNote;

  @ManyToOne(() => Field) // Assuming 'Field' is an entity representing the field definitions in a Template
  field: Field;

  @Column()
  content: string; // The actual content for this field
}

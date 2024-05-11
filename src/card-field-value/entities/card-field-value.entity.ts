import { Field } from 'src/card-field/entities/card-field.entity';
import { CardNote } from 'src/card-note/entities/card-note.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, ManyToOne, Column } from 'typeorm';

@Entity()
export class FieldValue extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => CardNote, (note) => note.fieldValues, {
    onDelete: 'CASCADE',
  })
  note: CardNote;

  @ManyToOne(() => Field, { onDelete: 'CASCADE' })
  field: Field;
}

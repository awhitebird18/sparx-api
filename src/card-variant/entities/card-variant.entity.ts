import { Field } from 'src/card-field/entities/card-field.entity';
import { Template } from 'src/card-template/entities/card-template.entity';
import { Card } from 'src/card/entities/card.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class CardVariant extends BaseEntity {
  @Column()
  title: string;

  // ManyToOne Relationships
  @ManyToOne(() => Template, (template) => template.cardVariants, {
    onDelete: 'CASCADE',
  })
  template: Template;

  @ManyToMany(() => Field, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  frontFields: Field[];

  @ManyToMany(() => Field, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  backFields: Field[];

  // OneToMany Relationships
  @OneToMany(() => Card, (flashcard) => flashcard.cardVariant)
  flashcards: Card[];
}

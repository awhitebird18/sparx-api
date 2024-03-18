import { Field } from 'src/card-field/entities/card-field.entity';
import { Template } from 'src/card-template/entities/card-template.entity';
import { Flashcard } from 'src/card/entities/card.entity';
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
export class CardType extends BaseEntity {
  @Column()
  title: string;

  @ManyToOne(() => Template, (template) => template.cardTypes)
  template: Template;

  @ManyToMany(() => Field)
  @JoinTable()
  frontFields: Field[];

  @ManyToMany(() => Field)
  @JoinTable()
  backFields: Field[];

  @OneToMany(() => Flashcard, (flashcard) => flashcard.cardType)
  flashcards: Flashcard[];
}

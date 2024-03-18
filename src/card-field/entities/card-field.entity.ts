import { Template } from 'src/card-template/entities/card-template.entity';
import { CardType } from 'src/card-type/entities/card-type.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';

@Entity()
export class Field extends BaseEntity {
  @Column()
  title: string;

  @ManyToMany(() => CardType)
  frontCardTypes: CardType[];

  @ManyToMany(() => CardType)
  backCardTypes: CardType[];

  @ManyToOne(() => Template, (template) => template.fields)
  template: Template;
}

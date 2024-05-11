import { Template } from 'src/card-template/entities/card-template.entity';
import { CardVariant } from 'src/card-variant/entities/card-variant.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';

@Entity()
export class Field extends BaseEntity {
  @Column()
  title: string;

  @ManyToMany(() => CardVariant, { onDelete: 'CASCADE' })
  frontCardVariants: CardVariant[];

  @ManyToMany(() => CardVariant, { onDelete: 'CASCADE' })
  backCardVariants: CardVariant[];

  @ManyToOne(() => Template, (template) => template.fields, {
    onDelete: 'CASCADE',
  })
  template: Template;
}

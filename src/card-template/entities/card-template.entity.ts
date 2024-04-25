import { Field } from 'src/card-field/entities/card-field.entity';
import { CardNote } from 'src/card-note/entities/card-note.entity';
import { CardVariant } from 'src/card-variant/entities/card-variant.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Template extends BaseEntity {
  @Column()
  title: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.templates, { nullable: true })
  user: User | null;

  @OneToMany(() => Field, (field) => field.template)
  fields: Field[];

  @OneToMany(() => CardVariant, (cardVariant) => cardVariant.template)
  cardVariants: CardVariant[];

  @OneToMany(() => CardNote, (note) => note.template)
  notes: CardNote[];
}

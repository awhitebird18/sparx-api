import { BaseEntity } from 'src/common/entities/base.entity';
import { UserChannel } from 'src/userchannels/entity/userchannel.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { SortBy } from '../enums';

@Entity()
export class Section extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ default: false, nullable: true })
  isSystem: boolean;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ nullable: true })
  emoji?: string;

  @Column({ nullable: true })
  orderIndex: number;

  @Column({ type: 'enum', enum: SortBy, default: SortBy.ALPHA })
  sortBy: SortBy;

  @OneToMany(() => UserChannel, (userchannel) => userchannel.section)
  channels: UserChannel[];

  @ManyToOne(() => User, (user) => user.sections)
  user?: User;
}

import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';

import { SortBy } from '../enums/sort-by.enum';

@Entity()
export class Section extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: false, nullable: true })
  isSystem: boolean;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  orderIndex: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: SortBy, default: SortBy.ALPHA })
  sortBy: SortBy;

  @OneToMany(() => ChannelSubscription, (userchannel) => userchannel.section)
  channels: ChannelSubscription[];

  @ManyToOne(() => User, (user) => user.sections)
  user: User;
}

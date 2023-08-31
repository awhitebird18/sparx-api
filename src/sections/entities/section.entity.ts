import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';

import { SortBy } from '../enums/sort-by.enum';
import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class Section extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: ChannelType })
  type: ChannelType;

  @Column({ default: false, nullable: true })
  isSystem: boolean;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  orderIndex: number;

  @Exclude()
  @Column()
  userId: number;

  @Column({ type: 'enum', enum: SortBy, default: SortBy.ALPHA })
  sortBy: SortBy;

  @OneToMany(() => ChannelSubscription, (userchannel) => userchannel.section)
  channels: ChannelSubscription[];

  @ManyToOne(() => User, (user) => user.sections)
  user: User;
}

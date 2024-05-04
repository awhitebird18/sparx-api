import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { SortBy } from '../enums/sort-by.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class Section extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: false, nullable: true })
  isDefault: boolean;

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

  // ManyToOne Relationships
  @ManyToOne(() => User, (user) => user.sections, {
    onDelete: 'CASCADE',
  })
  user: User;

  // OneToMany Relationships
  @OneToMany(() => ChannelSubscription, (userchannel) => userchannel.section)
  channels: ChannelSubscription[];
}

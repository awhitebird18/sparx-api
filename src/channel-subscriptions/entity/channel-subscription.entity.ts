import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Section } from 'src/sections/entities/section.entity';
import { CompletionStatus } from '../enum/completion-status.enum';

@Entity()
export class ChannelSubscription extends BaseEntity {
  @Column({ default: false })
  isMuted: boolean;

  @Column({ default: true })
  isSubscribed: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({
    type: 'enum',
    enum: CompletionStatus,
    default: CompletionStatus.InProgress,
  })
  status: CompletionStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastRead: Date;

  // ManyToOne Relationships
  @ManyToOne(() => User, (user) => user.channelSubscriptions, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.channelSubscriptions, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @ManyToOne(() => Section, (section) => section.channels, {
    onDelete: 'CASCADE',
  })
  section: Section;
}

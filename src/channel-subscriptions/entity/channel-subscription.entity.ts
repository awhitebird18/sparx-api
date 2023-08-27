import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Section } from 'src/sections/entities/section.entity';

@Entity()
export class ChannelSubscription extends BaseEntity {
  @Column({ default: false })
  isMuted: boolean;

  @Column({ default: true })
  isSubscribed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastRead: Date;

  @ManyToOne(() => User, (user) => user.channelSubscriptions)
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.channelSubscriptions)
  channel: Channel;

  @ManyToOne(() => Section, (section) => section.channels)
  section: Section;
}

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Section } from 'src/sections/entities/section.entity';

@Entity()
export class UserChannel extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userChannels)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.userChannels)
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ default: true })
  isSubscribed: boolean;

  @ManyToOne(() => Section, (section) => section.channels)
  section: Section;

  @Column({ type: 'timestamp', nullable: true })
  lastRead: Date;
}

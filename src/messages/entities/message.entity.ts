import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';

@Entity()
export class Message extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  channelId: string;
}

import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Reaction } from './reaction.entity';

@Entity()
export class Message extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @ManyToOne(() => Message, (message) => message.childMessages, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parentMessage: Message;

  @OneToMany(() => Message, (message) => message.parentMessage)
  childMessages: Message[];

  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions: Reaction[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  parentId: number;

  @Column()
  userId: string;

  @Column()
  channelId: string;
}

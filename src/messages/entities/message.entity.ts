import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Reaction } from './reaction.entity';

@Entity()
export class Message extends BaseEntity {
  @Column()
  content: string;

  @Column({ nullable: true })
  parentId?: number;

  @Column()
  userId: string;

  @Column()
  channelId: string;

  @Column({ default: false })
  isSystem: boolean;

  // ManyToOne Relationships
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @ManyToOne(() => Message, (message) => message.childMessages, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parentMessage: Message;

  // OneToMany Relationships
  @OneToMany(() => Message, (message) => message.parentMessage, {
    nullable: true,
  })
  childMessages?: Message[];

  @OneToMany(() => Reaction, (reaction) => reaction.message, { nullable: true })
  reactions?: Reaction[];
}

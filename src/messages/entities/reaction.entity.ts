import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Message } from 'src/messages/entities/message.entity';

@Entity()
export class Reaction extends BaseEntity {
  @Column()
  emojiId: string;

  @Column()
  userId: string;

  @Column()
  messageId: string;

  @ManyToOne(() => Message, (message) => message.reactions)
  @JoinColumn({ name: 'messageId' })
  message: Message;
}

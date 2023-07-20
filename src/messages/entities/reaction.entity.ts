import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from 'src/messages/entities/message.entity';

@Entity()
export class Reaction extends BaseEntity {
  @Column()
  emojiId: string;

  @ManyToOne(() => Message, (message) => message.reactions)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column()
  userId: string;

  @Column()
  messageId?: string;
}

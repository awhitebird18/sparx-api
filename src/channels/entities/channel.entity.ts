import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Message } from 'src/messages/entities/message.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Note } from 'src/notes/entities/note.entity';
import { Card } from 'src/card/entities/card.entity';

@Entity()
export class Channel extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  topic?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'float', default: 4000 })
  x: number;

  @Column({ type: 'float', default: 4000 })
  y: number;

  @Column({ nullable: true })
  icon?: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.channels)
  workspace: Workspace;

  @OneToMany(() => Message, (message) => message.channel, {
    cascade: ['soft-remove'],
  })
  messages: Message[];

  @OneToMany(() => Note, (note) => note.channel, {
    cascade: ['soft-remove'],
  })
  notes: Note[];

  @OneToMany(
    () => ChannelSubscription,
    (channelSubscription) => channelSubscription.channel,
    {
      cascade: ['soft-remove'],
    },
  )
  channelSubscriptions: ChannelSubscription[];

  @OneToMany(() => Card, (flashcard) => flashcard.channel, {
    cascade: ['soft-remove'],
  })
  flashcards: Card[];

  @ManyToOne(() => Channel, (parentChannel) => parentChannel.childChannels, {
    nullable: true,
  })
  parentChannel: Channel;

  @OneToMany(() => Channel, (childChannel) => childChannel.parentChannel)
  childChannels: Channel[];
}

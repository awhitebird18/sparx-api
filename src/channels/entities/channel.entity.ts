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

  // ManyToOne Relationships
  @ManyToOne(() => Workspace, (workspace) => workspace.channels, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @ManyToOne(() => Channel, (parentChannel) => parentChannel.childChannels, {
    onDelete: 'CASCADE',
  })
  parentChannel: Channel;

  // OneToMany Relationships
  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];

  @OneToMany(() => Note, (note) => note.channel)
  notes: Note[];

  @OneToMany(
    () => ChannelSubscription,
    (channelSubscription) => channelSubscription.channel,
  )
  channelSubscriptions: ChannelSubscription[];

  @OneToMany(() => Card, (flashcard) => flashcard.channel)
  flashcards: Card[];

  @OneToMany(() => Channel, (childChannel) => childChannel.parentChannel)
  childChannels: Channel[];
}

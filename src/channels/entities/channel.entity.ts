import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Message } from 'src/messages/entities/message.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';

import { ChannelType } from '../enums/channel-type.enum';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Note } from 'src/notes/entities/note.entity';
import { Flashcard } from 'src/card/entities/card.entity';
import { ChannelConnector } from 'src/channel-connectors/entities/channel-connector.entity';

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

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.CHANNEL,
  })
  type: ChannelType;

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

  @OneToMany(() => Flashcard, (flashcard) => flashcard.channel, {
    cascade: ['soft-remove'],
  })
  flashcards: Flashcard[];

  @OneToMany(() => ChannelConnector, (connector) => connector.childChannel, {
    cascade: ['soft-remove'],
  })
  childConnectors: ChannelConnector[];

  @OneToMany(() => ChannelConnector, (connector) => connector.parentChannel, {
    cascade: ['soft-remove'],
  })
  parentConnectors: ChannelConnector[];
}

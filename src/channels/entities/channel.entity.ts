import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Message } from 'src/messages/entities/message.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';

import { ChannelType } from '../enums/channel-type.enum';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

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

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];

  @OneToMany(
    () => ChannelSubscription,
    (channelSubscription) => channelSubscription.channel,
  )
  channelSubscriptions: ChannelSubscription[];
}

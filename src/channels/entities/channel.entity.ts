import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { ChannelType } from '../enums/channel-type.enum';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';

@Entity()
export class Channel extends BaseEntity {
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  topic?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isPrivate?: boolean;

  @Column({ nullable: true })
  icon?: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.CHANNEL,
  })
  type: ChannelType;

  @ManyToOne(() => Company, (company) => company.channels)
  company: Company;

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];

  @OneToMany(
    () => ChannelSubscription,
    (channelSubscription) => channelSubscription.channel,
  )
  channelSubscriptions: ChannelSubscription[];
}

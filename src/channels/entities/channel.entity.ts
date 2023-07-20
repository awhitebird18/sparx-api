import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Section } from 'src/sections/entities/section.entity';
import { Space } from 'src/spaces/entities/space.entity';
import { Entity, Column, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import { ChannelType } from '../enums/channelType.enum';
import { UserChannel } from 'src/userchannels/entity/userchannel.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Channel extends BaseEntity {
  @Column()
  name: string;

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

  @ManyToOne(() => Space, (space) => space.channels)
  space: Space;

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];

  @OneToMany(() => UserChannel, (userChannel) => userChannel.channel)
  userChannels: UserChannel[];

  @ManyToOne(() => Section, (section) => section.channels)
  section: Section;
}

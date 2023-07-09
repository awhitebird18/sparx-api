import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Section } from 'src/sections/entities/section.entity';
import { Space } from 'src/spaces/entities/space.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, OneToMany, ManyToMany, ManyToOne } from 'typeorm';
import { ChannelType } from '../enums/channelType.enum';

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

  @ManyToMany(() => User, (user) => user.channels)
  users: User[];

  @ManyToOne(() => Section, (section) => section.channels)
  section: Section;
}

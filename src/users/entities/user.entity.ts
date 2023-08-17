import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Section } from 'src/sections/entities/section.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PrimaryColor, Theme } from '../enums';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: false })
  isBot?: boolean;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: Theme.LIGHT })
  theme: Theme;

  @Column({ default: PrimaryColor.BLUE })
  primaryColor: PrimaryColor;

  @ManyToOne(() => Company, (company) => company.users)
  company: Company;

  @OneToMany(() => Section, (section) => section.user)
  sections: Section[];

  @OneToMany(
    () => ChannelSubscription,
    (channelSubscription) => channelSubscription.user,
  )
  channelSubscriptions: ChannelSubscription[];

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: 'password' })
  password: string;

  @OneToOne(() => UserPreferences, (userPreferences) => userPreferences.user)
  @JoinColumn()
  preferences: UserPreferences;
}

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
import { UserChannel } from 'src/userchannels/entity/userchannel.entity';
import { Userpreferences } from 'src/userpreferences/entities/userpreference.entity';

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

  @OneToMany(() => UserChannel, (userChannel) => userChannel.user)
  userChannels: UserChannel[];

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: 'password' })
  password: string;

  @OneToOne(() => Userpreferences, (userpreferences) => userpreferences.user)
  @JoinColumn()
  preferences: Userpreferences;
}

import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Section } from 'src/sections/entities/section.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { UserRoles } from '../enums/roles.enum';
import { UserStatus } from 'src/user-statuses/entities/user-status.entity';

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
  isBot: boolean;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column()
  password: string;

  @Column({ nullable: true })
  workspaceId: string;

  @Column({ default: UserRoles.USER })
  role: UserRoles;

  @OneToMany(() => UserStatus, (userStatus) => userStatus.user)
  customStatuses: UserStatus[];

  @OneToOne(() => UserPreferences, (userPreferences) => userPreferences.user)
  preferences: UserPreferences;

  @ManyToOne(() => Workspace, (company) => company.users)
  workspace: Workspace;

  @OneToMany(() => Section, (section) => section.user)
  sections: Section[];

  @OneToMany(
    () => ChannelSubscription,
    (channelSubscription) => channelSubscription.user,
  )
  channelSubscriptions: ChannelSubscription[];
}

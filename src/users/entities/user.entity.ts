import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Section } from 'src/sections/entities/section.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';
import { UserRole } from '../enums/roles.enum';
import { UserStatus } from 'src/user-statuses/entities/user-status.entity';
import { Note } from 'src/notes/entities/note.entity';
import { Template } from 'src/card-template/entities/card-template.entity';
import { Card } from 'src/card/entities/card.entity';
import { ReviewHistory } from 'src/review-history/entities/review-history.entity';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { NodemapSettings } from 'src/nodemap-settings/entities/nodemap-setting.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Experience } from 'src/experience/entities/experience.entity';
import { Activity } from 'src/activity/entities/activity.entity';

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

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isTemporary: boolean;

  @Column()
  password: string;

  @Column({ default: UserRole.MEMBER })
  role: UserRole;

  // OneToOne Relationships
  @OneToOne(() => UserPreferences, (userPreferences) => userPreferences.user)
  preferences: UserPreferences;

  // OneToMany Relationships
  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.user)
  userWorkspaces: UserWorkspace[];

  @OneToMany(() => UserStatus, (userStatus) => userStatus.user)
  customStatuses: UserStatus[];

  @OneToMany(() => Note, (note) => note.createdBy)
  notes: Note[];

  @OneToMany(() => Section, (section) => section.user)
  sections: Section[];

  @OneToMany(
    () => ChannelSubscription,
    (channelSubscription) => channelSubscription.user,
  )
  channelSubscriptions: ChannelSubscription[];

  @OneToMany(() => Template, (template) => template.user)
  templates: Template[];

  @OneToMany(() => Card, (flashcard) => flashcard.user)
  flashcards: Card[];

  @OneToMany(() => ReviewHistory, (reviewHistory) => reviewHistory.user)
  reviewHistories: ReviewHistory[];

  @OneToMany(() => NodemapSettings, (nodemapSettings) => nodemapSettings.user)
  nodemapSettings: NodemapSettings[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Experience, (experience) => experience.user)
  experience: Experience[];

  @OneToMany(() => Activity, (activity) => activity.user)
  activity: Activity[];
}

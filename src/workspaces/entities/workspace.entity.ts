import { Activity } from 'src/activity/entities/activity.entity';
import { Template } from 'src/card-template/entities/card-template.entity';
import { Card } from 'src/card/entities/card.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Experience } from 'src/experience/entities/experience.entity';
import { NodemapSettings } from 'src/nodemap-settings/entities/nodemap-setting.entity';
import { Note } from 'src/notes/entities/note.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Workspace extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: true })
  allowInvites: boolean;

  @Column({ nullable: true })
  imgUrl: string;

  @OneToMany(() => Channel, (channel) => channel.workspace)
  channels: Channel[];

  @OneToMany(() => Note, (note) => note.workspace)
  notes: Note[];

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace)
  userWorkspaces: UserWorkspace[];

  @OneToMany(
    () => NodemapSettings,
    (nodemapSettings) => nodemapSettings.workspace,
  )
  nodemapSettings: NodemapSettings[];

  @OneToMany(() => Task, (task) => task.workspace)
  tasks: Task[];

  @OneToMany(() => Experience, (experience) => experience.workspace)
  experience: Experience[];

  @OneToMany(() => Activity, (activity) => activity.workspace)
  activity: Activity;

  @OneToMany(() => Card, (flashcard) => flashcard.workspace)
  flashcards: Card[];

  @OneToMany(() => Template, (template) => template.workspace)
  templates: Template[];
}

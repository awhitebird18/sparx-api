import { Activity } from 'src/activity/entities/activity.entity';
import { ChannelConnector } from 'src/channel-connectors/entities/channel-connector.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Experience } from 'src/experience/entities/experience.entity';
import { NodemapSettings } from 'src/nodemap-settings/entities/nodemap-setting.entity';
import { Note } from 'src/notes/entities/note.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { User } from 'src/users/entities/user.entity';
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

  @OneToMany(() => User, (user) => user.workspace)
  users: User[];

  @OneToMany(() => Channel, (channel) => channel.workspace)
  channels: Channel[];

  @OneToMany(() => Note, (note) => note.workspace)
  notes: Note[];

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace)
  userWorkspaces: UserWorkspace[];

  @OneToMany(
    () => ChannelConnector,
    (channelConnector) => channelConnector.workspace,
  )
  channelConnectors: ChannelConnector[];

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
}

import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Note extends BaseEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ default: true })
  isPrivate: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Channel, (channel) => channel.notes, {
    cascade: ['soft-remove'],
  })
  channel: Channel;

  @ManyToOne(() => User, (user) => user.notes, { nullable: true })
  createdBy?: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.notes)
  workspace: Workspace;
}

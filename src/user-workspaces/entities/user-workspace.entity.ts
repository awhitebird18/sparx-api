import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Entity, ManyToOne, Column } from 'typeorm';

@Entity()
export class UserWorkspace extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userWorkspaces)
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.userWorkspaces)
  workspace: Workspace;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastViewed: Date;

  @Column({ default: 0 })
  streakCount: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  goal: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ default: true })
  isFirstLogin: boolean;
}

import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Entity()
export class Experience extends BaseEntity {
  @Column('int')
  points: number;

  // ManyToOne Relationships
  @ManyToOne(() => User, (user) => user.experience, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.experience, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;
}

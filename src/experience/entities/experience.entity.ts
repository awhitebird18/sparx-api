import { Entity, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Entity()
export class Experience extends BaseEntity {
  @ManyToOne(() => User, (user) => user.experience, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.experience, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Column('int')
  points: number;

  @CreateDateColumn({ type: 'date' })
  date: Date;
}

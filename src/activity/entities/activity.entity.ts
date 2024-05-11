import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Activity extends BaseEntity {
  @Column()
  type: string;

  @Column()
  text: string;

  @Column({ nullable: true })
  referenceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.activity, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.activity, {
    onDelete: 'CASCADE',
  })
  user: User;
}

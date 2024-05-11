import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Task extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  actionUrl: string;

  @Column({ nullable: true })
  channelId: string;

  @Column()
  dueDate: Date;

  @Column({ default: 'Note' })
  type: string;

  @Column({ default: false })
  isComplete: boolean;

  @Column({ type: 'varchar', nullable: true })
  recurrence: string | null;

  // ManyToOne Relationships
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.tasks, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;
}

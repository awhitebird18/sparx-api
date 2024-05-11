import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class NodemapSettings extends BaseEntity {
  @Column({ default: true })
  userCountVisible: boolean;

  @Column({ default: true })
  flashcardsDueVisible: boolean;

  @Column({ default: true })
  unreadMessageCountVisible: boolean;

  @Column({ type: 'double precision', default: 1000 })
  initialX: number;

  @Column({ type: 'double precision', default: 1000 })
  initialY: number;

  @Column({ type: 'double precision', default: 1 })
  scale: number;

  // ManyToOne Relationships
  @ManyToOne(() => User, (user) => user.nodemapSettings, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.nodemapSettings, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;
}

import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class NodemapSettings extends BaseEntity {
  @ManyToOne(() => User, (user) => user.nodemapSettings)
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.nodemapSettings)
  workspace: Workspace;

  @Column({ default: true })
  userCountVisible: boolean;

  @Column({ default: true })
  flashcardsDueVisible: boolean;

  @Column({ default: true })
  unreadMessageCountVisible: boolean;

  @Column({ type: 'double precision', default: 4000 })
  xPosition: number;

  @Column({ type: 'double precision', default: 4000 })
  yPosition: number;

  @Column({ type: 'double precision', default: 1 })
  zoomLevel: number;
}

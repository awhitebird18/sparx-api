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
  userCountVisible: boolean; // Indicates if user count is visible

  @Column({ default: true })
  flashcardsDueVisible: boolean; // Indicates if flashcards due count is visible

  @Column({ default: true })
  unreadMessageCountVisible: boolean; // Indicates if user discussion count is visible

  @Column({ type: 'double precision', default: 4000 })
  xPosition: number; // X position of the nodemap viewport or a specific element

  @Column({ type: 'double precision', default: 4000 })
  yPosition: number; // Y position of the nodemap viewport or a specific element

  @Column({ type: 'double precision', default: 1 })
  zoomLevel: number; // Zoom level of the nodemap
}

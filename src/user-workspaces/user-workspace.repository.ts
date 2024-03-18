import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { UserWorkspace } from './entities/user-workspace.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Injectable()
export class UserWorkspacesRepository extends Repository<UserWorkspace> {
  constructor(private dataSource: DataSource) {
    super(UserWorkspace, dataSource.createEntityManager());
  }

  joinWorkspace(user: User, workspace: Workspace, isAdmin?: boolean) {
    const userWorkspaceRecord = this.create({ user, workspace, isAdmin });

    return this.save(userWorkspaceRecord);
  }

  findWorkspaceUsers(workspace: Workspace) {
    return this.find({ where: { workspace: { id: workspace.id } } });
  }
}

import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { DataSource } from 'typeorm';

export async function seedWorkspaceUsers(AppDataSource: DataSource) {
  const workspacesRepository = AppDataSource.getRepository(Workspace);
  const usersRepository = AppDataSource.getRepository(User);
  const userWorkspaceRepository = AppDataSource.getRepository(UserWorkspace);

  const [workspace, users] = await Promise.all([
    workspacesRepository.findOne({ where: { name: 'Full Stack Development' } }),
    usersRepository.find(),
  ]);

  const workspaceUsers = [];
  for (let i = 0; i < users.length; i++) {
    const workspaceUser = new UserWorkspace();
    workspaceUser.user = users[i];
    workspaceUser.workspace = workspace;

    workspaceUsers.push(workspaceUser);
  }

  await userWorkspaceRepository.save(workspaceUsers);
}

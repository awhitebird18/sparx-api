import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { DataSource } from 'typeorm';

export async function seedWorkspaceUsers(AppDataSource: DataSource) {
  const workspacesRepository = AppDataSource.getRepository(Workspace);
  const usersRepository = AppDataSource.getRepository(User);
  const userWorkspaceRepository = AppDataSource.getRepository(UserWorkspace);

  const [workspaces, users] = await Promise.all([
    workspacesRepository.find(),
    usersRepository.find(),
  ]);

  for (const workspace of workspaces) {
    const workspaceUsersData = users.map((user) => {
      const workspaceUser = new UserWorkspace();

      workspaceUser.user = user;
      workspaceUser.workspace = workspace;
      workspaceUser.isAdmin = user.isAdmin;

      return workspaceUser;
    });

    await userWorkspaceRepository.save(workspaceUsersData);
  }
}

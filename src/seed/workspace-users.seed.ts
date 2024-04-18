import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { DataSource } from 'typeorm';

export async function seedWorkspaceUsers(
  AppDataSource: DataSource,
  workspace: Workspace,
  users: User[],
  userId: string,
) {
  const userWorkspaceRepository = AppDataSource.getRepository(UserWorkspace);

  console.log(`User count: ${users.length}`);

  const workspaceUsersData = users
    .filter((user) => user.uuid !== userId)
    .map((user) => {
      const workspaceUser = new UserWorkspace();

      workspaceUser.user = user;
      workspaceUser.workspace = workspace;
      workspaceUser.isAdmin = user.isAdmin;

      return workspaceUser;
    });

  await userWorkspaceRepository.insert(workspaceUsersData);
}

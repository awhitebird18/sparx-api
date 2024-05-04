import { User } from 'src/users/entities/user.entity';

export async function getUsersInWorkspace(
  userWorkspaceRepository,
  workspaceId: string,
): Promise<User[]> {
  const userWorkspaces = await userWorkspaceRepository.find({
    where: { workspace: { uuid: workspaceId } },
    relations: ['user'],
  });

  const users = userWorkspaces.map((userWorkspace) => userWorkspace.user);

  return users;
}

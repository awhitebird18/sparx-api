import { User } from 'src/users/entities/user.entity';

export async function getUsersInWorkspace(
  userWorkspaceRepository,
  workspaceId: string,
): Promise<User[]> {
  // Find all userWorkspaces that belong to the given workspaceId
  const userWorkspaces = await userWorkspaceRepository.find({
    where: { workspace: { uuid: workspaceId } },
    relations: ['user'], // Load the associated user for each userWorkspace
  });

  // Extract users from userWorkspaces
  const users = userWorkspaces.map((userWorkspace) => userWorkspace.user);

  return users;
}

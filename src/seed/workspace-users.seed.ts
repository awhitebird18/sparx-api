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

  const userCount = users.length;

  for (const workspace of workspaces) {
    // Determine a random number of users to add to each workspace
    const numberOfUsersToAdd =
      Math.floor(Math.random() * Math.min(20, userCount)) + 1; // Ensure at least 1 user

    // Randomly pick users to add to the workspace
    const selectedUsers = [];
    for (let i = 0; i < numberOfUsersToAdd; i++) {
      // Generate a random index for users array
      const randomIndex = Math.floor(Math.random() * userCount);
      const selectedUser = users[randomIndex];

      // Check if the user is already added to avoid duplicates
      if (!selectedUsers.includes(selectedUser)) {
        const workspaceUser = new UserWorkspace();
        workspaceUser.user = selectedUser;
        workspaceUser.workspace = workspace;

        selectedUsers.push(workspaceUser);
      } else {
        // Optionally, decrement i to ensure the workspace gets the intended number of users
        // But be cautious as this could potentially lead to an infinite loop if not enough unique users are available
        i--;
      }
    }

    // Assuming you have a many-to-many relation set up properly with cascade options
    // You can simply assign the selectedUsers array to the workspace's users property
    // For example, if your Workspace entity has a users property for the relation
    // workspace.users = selectedUsers;

    // Save the updated workspace entity with its new users
    await userWorkspaceRepository.save(selectedUsers);
  }
}

import { User } from '../users/entities/user.entity';
import { NodemapSettings } from '../nodemap-settings/entities/nodemap-setting.entity';
import { getUsersInWorkspace } from './getUsersInWorkspace';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

export async function seedUserNodemapSettings(
  AppDataSource,
  workspace: Workspace,
) {
  const userRepository = AppDataSource.getRepository(UserWorkspace);
  const nodemapSettingsRepository =
    AppDataSource.getRepository(NodemapSettings);

  // Assuming users are already seeded and you want to assign NodemapSettings to each
  const users = await getUsersInWorkspace(userRepository, workspace.uuid);

  const nodemapSettingsList = users.map((user) => {
    const nodemapSettings = new NodemapSettings();
    nodemapSettings.user = user;
    nodemapSettings.userCountVisible = true;
    nodemapSettings.flashcardsDueVisible = true;
    // Set other properties as needed
    return nodemapSettings;
  });

  await nodemapSettingsRepository.insert(nodemapSettingsList);
}

import { User } from '../users/entities/user.entity';
import { NodemapSettings } from '../nodemap-settings/entities/nodemap-setting.entity';

export async function seedUserNodemapSettings(AppDataSource) {
  const userRepository = AppDataSource.getRepository(User);
  const nodemapSettingsRepository =
    AppDataSource.getRepository(NodemapSettings);

  // Assuming users are already seeded and you want to assign NodemapSettings to each
  const users = await userRepository.find();

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

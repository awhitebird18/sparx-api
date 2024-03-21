import { User } from '../users/entities/user.entity';
import { UserPreferences } from '../user-preferences/entities/user-preference.entity';
import { Theme } from '../users/enums/theme.enum';
import { PrimaryColor } from '../users/enums/primary-color.enum';
import { NotificationType } from '../user-preferences/enums/notification-type.enum';

// Seed UserPreferences
export async function seedUserPreferences(AppDataSource) {
  const userRepository = AppDataSource.getRepository(User);
  const userPreferencesRepository =
    AppDataSource.getRepository(UserPreferences);

  const users = await userRepository.find();

  const userPreferencesList = users.map((user) => {
    const userPreferences = new UserPreferences();
    userPreferences.user = user;
    userPreferences.theme = Theme.LIGHT; // Assuming Theme.LIGHT is a valid enum or value
    userPreferences.primaryColor = PrimaryColor.BLUE; // Same for PrimaryColor.BLUE
    userPreferences.notificationType = NotificationType.ALL; // Same for NotificationType.ALL
    userPreferences.userId = user.id;
    return userPreferences;
  });

  await userPreferencesRepository.insert(userPreferencesList);
}

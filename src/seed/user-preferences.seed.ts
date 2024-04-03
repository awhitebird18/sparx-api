import { User } from '../users/entities/user.entity';
import { UserPreferences } from '../user-preferences/entities/user-preference.entity';
import { Theme } from '../users/enums/theme.enum';
import { PrimaryColor } from '../users/enums/primary-color.enum';
import { NotificationType } from '../user-preferences/enums/notification-type.enum';

export async function seedUserPreferences(AppDataSource) {
  const userRepository = AppDataSource.getRepository(User);
  const userPreferencesRepository =
    AppDataSource.getRepository(UserPreferences);

  const users = await userRepository.find();

  // Helper function to get a random enum value
  const getRandomPrimaryColor = (): PrimaryColor => {
    const enumValues = Object.values(PrimaryColor);
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
  };

  const userPreferencesList = users.map((user) => {
    const userPreferences = new UserPreferences();
    userPreferences.user = user;
    userPreferences.theme = Theme.DARK; // Assuming Theme.LIGHT is a valid enum or value
    userPreferences.primaryColor = getRandomPrimaryColor(); // Assign a random primary color
    userPreferences.notificationType = NotificationType.ALL; // Same for NotificationType.ALL
    userPreferences.userId = user.id;
    return userPreferences;
  });

  await userPreferencesRepository.insert(userPreferencesList);
}

import { UserPreferences } from '../user-preferences/entities/user-preference.entity';
import { Theme } from '../users/enums/theme.enum';
import { PrimaryColor } from '../users/enums/primary-color.enum';
import { User } from 'src/users/entities/user.entity';

export async function seedUserPreferences(AppDataSource) {
  const userRepository = AppDataSource.getRepository(User);
  const userPreferencesRepository =
    AppDataSource.getRepository(UserPreferences);

  const users = await userRepository.find({ where: { isBot: true } });

  // Helper function to get a random enum value
  const getRandomPrimaryColor = (): PrimaryColor => {
    const enumValues = Object.values(PrimaryColor);
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
  };

  const userPreferencesList = users.map((user) => {
    const userPreferences = new UserPreferences();
    userPreferences.user = user;
    userPreferences.theme = Theme.DARK;
    userPreferences.primaryColor = getRandomPrimaryColor();
    userPreferences.userId = user.id;
    return userPreferences;
  });

  await userPreferencesRepository.save(userPreferencesList);
}

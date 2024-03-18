import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { faker } from '@faker-js/faker';

export async function seedUsers(AppDataSource: DataSource) {
  // Seeding logic here
  const userRepository = AppDataSource.getRepository(User);

  const users = [];

  for (let i = 0; i < 100; i++) {
    const newUser = new User();

    const firstName = faker.person.firstName('male');
    const lastName = faker.person.lastName('male');

    newUser.firstName = faker.person.firstName('male');
    newUser.lastName = faker.person.lastName('male');
    newUser.email = faker.internet.email({ firstName, lastName });
    newUser.password = 'password1';

    users.push(newUser);
  }

  // Set other properties as needed
  await userRepository.save(users);
}

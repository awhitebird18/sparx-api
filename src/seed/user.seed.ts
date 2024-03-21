import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export async function seedUsers(AppDataSource: DataSource) {
  // Seeding logic here
  const userRepository = AppDataSource.getRepository(User);

  const users = [];

  const hashedPassword = await bcrypt.hash('Password1', 10);

  const aaron = new User();
  Object.assign(aaron, {
    firstName: 'Aaron',
    lastName: 'Whitebird',
    isAdmin: true,
    email: 'aaron.whitebird@gmail.com',
    password: hashedPassword,
    isVerified: true,
  });

  const shanu = new User();
  Object.assign(shanu, {
    firstName: 'Shanu',
    lastName: 'Shanu',
    isAdmin: true,
    email: 'awhitebirdtestingthings@gmail.com',
    password: hashedPassword,
    isVerified: true,
  });

  const defaultUsers = [aaron, shanu];

  for (let i = 0; i < 30; i++) {
    const newUser = new User();

    const firstName = faker.person.firstName('male');
    const lastName = faker.person.lastName('male');

    newUser.firstName = faker.person.firstName('male');
    newUser.lastName = faker.person.lastName('male');
    newUser.email = faker.internet.email({ firstName, lastName });
    newUser.password = hashedPassword;

    users.push(newUser);
  }

  users.push(...defaultUsers);

  // Set other properties as needed
  await userRepository.save(users);
}

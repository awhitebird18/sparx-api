import { performance } from 'perf_hooks';
import { DataSource } from 'typeorm';
import { getOptions } from './typeorm-config';
import { seedUsers } from './user.seed';
import { seedUserPreferences } from './user-preferences.seed';

(async function () {
  console.info('Bot Seed starting');

  const AppDataSource = new DataSource(getOptions());

  await AppDataSource.initialize();
  console.info('Database Initialized');

  const seedOperations = [
    { name: 'Users', function: () => seedUsers(AppDataSource) },
    { name: 'Preferences', function: () => seedUserPreferences(AppDataSource) },
  ];

  for (const operation of seedOperations) {
    const startTime = performance.now();
    await operation.function();
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    console.info(`${operation.name} seeded in ${timeTaken}ms`);
  }

  console.info(`Seed Complete!`);
})();

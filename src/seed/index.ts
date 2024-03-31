import { DataSource } from 'typeorm';
import { options } from './typeorm-config';
import { seedUsers } from './user.seed';
import { seedUserNodemapSettings } from './user-nodemapSettings.seed';
import { seedUserPreferences } from './user-preferences.seed';
import { seedWorkspaces } from './workspace.seed';
import { seedChannels } from './channel.seed';
import { seedSections } from './sections.seed';
import { seedChannelSubscriptions } from './channel-subscriptions2.seed';
import { seedWorkspaceUsers } from './add-users-to-workspace.seed';
import { seedChannelConnectors } from './channel-connectors.seed';
import { seedActivity } from './activity.seed';
// import { seedMessages } from './message.seed';

// Create TypeORM DataSource

(async function () {
  console.log('1: Database connection options:', options);
  const AppDataSource = new DataSource(options);

  await AppDataSource.initialize();
  console.log('2: Database Initialized');

  await seedUsers(AppDataSource);
  console.log('3');
  await seedUserNodemapSettings(AppDataSource);
  console.log('4');
  await seedUserPreferences(AppDataSource);
  console.log('5');
  await seedWorkspaces(AppDataSource);
  console.log('6');
  await seedWorkspaceUsers(AppDataSource);
  await seedSections(AppDataSource);
  await seedChannels(AppDataSource);
  await seedChannelConnectors(AppDataSource);
  await seedChannelSubscriptions(AppDataSource);
  await seedActivity(AppDataSource);

  console.log('complete');

  // await seedMessages(AppDataSource);
})();

import { DataSource } from 'typeorm';
import { getOptions } from './typeorm-config';
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
  const AppDataSource = new DataSource(getOptions());
  console.log(`Connection options: ${getOptions()}`);
  console.log('1: Seed starting...');

  await AppDataSource.initialize();
  console.log('2: Database Initialized');

  console.log(AppDataSource);

  await seedUsers(AppDataSource);
  console.log('3: Users Seeded');

  await seedUserNodemapSettings(AppDataSource);
  console.log('4: Nodemap settings seeded');

  await seedUserPreferences(AppDataSource);
  console.log('5: User preferences seeded');

  await seedWorkspaces(AppDataSource);
  console.log('6: Workspaces seeded');

  await seedWorkspaceUsers(AppDataSource);
  console.log('7: User Workspace data seeded');

  await seedSections(AppDataSource);
  console.log('8: Sections seeded');

  await seedChannels(AppDataSource);
  console.log('9: Channels seeded');

  await seedChannelConnectors(AppDataSource);
  console.log('10: Channel Connectors seeded');

  await seedChannelSubscriptions(AppDataSource);
  console.log('11: Channel Subscriptions seeded');

  await seedActivity(AppDataSource);
  console.log('12: Workspace Activity seeded');

  console.log('13: Seed Complete!');
})();

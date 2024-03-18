import { DataSource } from 'typeorm';
import { options } from './typeorm-config';
import { seedUsers } from './user.seed';
import { seedUserNodemapSettings } from './user-nodemapSettings.seed';
import { seedUserPreferences } from './user-preferences.seed';
import { seedWorkspaces } from './workspace.seed';
import { seedChannels } from './channel.seed';
import { seedSections } from './sections.seed';
import { seedChannelSubscriptions } from './channel-subscriptions.seed';
import { seedWorkspaceUsers } from './workspace-users.seed';
import { seedMessages } from './message.seed';

// Create TypeORM DataSource

(async function () {
  const AppDataSource = new DataSource(options);
  await AppDataSource.initialize();

  await seedUsers(AppDataSource);
  await seedUserNodemapSettings(AppDataSource);
  await seedUserPreferences(AppDataSource);
  await seedWorkspaces(AppDataSource);
  await seedWorkspaceUsers(AppDataSource);
  await seedSections(AppDataSource);
  await seedChannels(AppDataSource);
  await seedChannelSubscriptions(AppDataSource);
  await seedMessages(AppDataSource);
})();

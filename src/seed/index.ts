import { performance } from 'perf_hooks';
import { DataSource } from 'typeorm';
import { getOptions } from './typeorm-config';
import { seedUsers } from './user.seed';
import { seedUserNodemapSettings } from './user-nodemapSettings.seed';
import { seedUserPreferences } from './user-preferences.seed';
import { seedWorkspaces } from './workspace.seed';
import { seedChannels } from './channel.seed';
import { seedSections } from './sections.seed';
import { seedChannelSubscriptions } from './channel-subscriptions-2.seed';
import { seedWorkspaceUsers } from './workspace-users.seed';
import { seedChannelConnectors } from './channel-connectors.seed';
import { seedMessages } from './message.seed';
import { seedActivity } from './activity.seed';

(async function () {
  console.info('Seed starting');

  const AppDataSource = new DataSource(getOptions());

  await AppDataSource.initialize();
  console.info('Database Initialized');

  const seedOperations = [
    { name: 'Users', function: seedUsers },
    { name: 'Nodemap Settings', function: seedUserNodemapSettings },
    { name: 'User Preferences', function: seedUserPreferences },
    { name: 'Workspaces', function: seedWorkspaces },
    { name: 'Workspace Users', function: seedWorkspaceUsers },
    { name: 'Sections', function: seedSections },
    { name: 'Channels', function: seedChannels },
    { name: 'Channel Connectors', function: seedChannelConnectors },
    { name: 'Workspace Activity', function: seedActivity },
    { name: 'Channel Subscriptions', function: seedChannelSubscriptions },
    { name: 'Messages', function: seedMessages },
  ];

  for (const operation of seedOperations) {
    const startTime = performance.now();
    await operation.function(AppDataSource);
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    console.info(`${operation.name} seeded in ${timeTaken}ms`);
  }

  console.info(`Seed Complete!`);
})();

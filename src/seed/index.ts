import { performance } from 'perf_hooks';
import { DataSource } from 'typeorm';
import { getOptions } from './typeorm-config';
import { seedUsers } from './user.seed';
import { seedUserNodemapSettings } from './user-nodemapSettings.seed';
import { seedUserPreferences } from './user-preferences.seed';
import { seedWorkspaces } from './workspace.seed';
import { seedChannels } from './channel.seed';
import { seedSections } from './sections.seed';
import { seedChannelSubscriptions } from './channel-subscriptions.seed';
import { seedWorkspaceUsers } from './add-users-to-workspace.seed';
import { seedChannelConnectors } from './channel-connectors.seed';
import { seedActivity } from './activity.seed';

(async function () {
  console.log('Seed starting');

  const AppDataSource = new DataSource(getOptions());

  await AppDataSource.initialize();
  console.log('Database Initialized');

  const seedOperations = [
    { name: 'Users', function: seedUsers },
    { name: 'Nodemap Settings', function: seedUserNodemapSettings },
    { name: 'User Preferences', function: seedUserPreferences },
    { name: 'Workspaces', function: seedWorkspaces },
    { name: 'Workspace Users', function: seedWorkspaceUsers },
    { name: 'Sections', function: seedSections },
    { name: 'Channels', function: seedChannels },
    { name: 'Channel Connectors', function: seedChannelConnectors },
    { name: 'Channel Subscriptions', function: seedChannelSubscriptions },
    { name: 'Workspace Activity', function: seedActivity },
  ];

  for (const operation of seedOperations) {
    const startTime = performance.now();
    await operation.function(AppDataSource);
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    console.log(`${operation.name} seeded in ${timeTaken}ms`);
  }

  console.log(`Seed Complete!`);
})();

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
import { seedMessages } from './message.seed';
import { seedActivity } from './activity.seed';
import { seedFlashcardTemplate } from './flashcard-template.seed';

// (async function () {
//   console.info('Seed starting');

//   const AppDataSource = new DataSource(getOptions());

//   await AppDataSource.initialize();
//   console.info('Database Initialized');

//   const seedOperations = [
//     { name: 'Users', function: () => seedUsers(AppDataSource) },
//     {
//       name: 'Nodemap Settings',
//       function: () => seedUserNodemapSettings(AppDataSource),
//     },
//     {
//       name: 'User Preferences',
//       function: () => seedUserPreferences(AppDataSource),
//     },
//     { name: 'Workspaces', function: () => seedWorkspaces(AppDataSource) },
//     {
//       name: 'Workspace Users',

//       function: () => seedWorkspaceUsers(AppDataSource, ''),
//     },
//     { name: 'Sections', function: () => seedSections(AppDataSource) },
//     { name: 'Channels', function: () => seedChannels(AppDataSource) },
//     { name: 'Workspace Activity', function: () => seedActivity(AppDataSource) },
//     {
//       name: 'Channel Subscriptions',
//       function: () => seedChannelSubscriptions(AppDataSource),
//     },
//     { name: 'Messages', function: () => seedMessages(AppDataSource) },
//     {
//       name: 'Flashcard Templates',
//       function: () => seedFlashcardTemplate(AppDataSource),
//     },
//   ];

//   for (const operation of seedOperations) {
//     const startTime = performance.now();
//     await operation.function();
//     const endTime = performance.now();
//     const timeTaken = (endTime - startTime).toFixed(2);
//     console.info(`${operation.name} seeded in ${timeTaken}ms`);
//   }

//   console.info(`Seed Complete!`);
// })();

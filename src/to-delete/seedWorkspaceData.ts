import { DataSource } from 'typeorm';
import { seedUsers } from './user.seed';
import { seedUserNodemapSettings } from './user-nodemapSettings.seed';
import { seedUserPreferences } from './user-preferences.seed';
import { seedChannelSubscriptions } from './channel-subscriptions-2.seed';
import { seedWorkspaceUsers } from './workspace-users.seed';
import { seedMessages } from './message.seed';
import { seedActivity } from './activity.seed';
import { config } from 'src/typeorm';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

export async function seedWorkspaceData(workspaceId: string, userId: string) {
  const AppDataSource = new DataSource(config);

  await AppDataSource.initialize();

  const workspaceRepository = AppDataSource.getRepository(Workspace);

  const workspace = await workspaceRepository.findOne({
    where: { uuid: workspaceId },
  });

  const users = await seedUsers(AppDataSource);
  await seedWorkspaceUsers(AppDataSource, workspace, users, userId);
  await seedUserNodemapSettings(AppDataSource, workspace);
  await seedUserPreferences(AppDataSource);
  await seedActivity(AppDataSource, workspace, userId);
  await seedChannelSubscriptions(AppDataSource, workspace);
  await seedMessages(AppDataSource);
}

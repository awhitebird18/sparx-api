import { Channel } from '../channels/entities/channel.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Activity } from 'src/activity/entities/activity.entity';
import { User } from 'src/users/entities/user.entity';

export async function seedActivity(
  AppDataSource,
  workspace: Workspace,
  userId: string,
) {
  const channelsRepository = AppDataSource.getRepository(Channel);
  const activityRepository = AppDataSource.getRepository(Activity);
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { uuid: userId },
  });

  const channels = await channelsRepository.find({
    where: { workspace: { uuid: workspace.uuid } },
  });

  const activityEntries = [];

  for (let i = 0; i < channels.length; i++) {
    const newActivity = activityRepository.create({
      workspace,
      user,
      text: `has created a new section for ${channels[i].name}.`,
      type: 'content',
    });

    activityEntries.push(newActivity);
  }

  await activityRepository.insert(activityEntries);
}

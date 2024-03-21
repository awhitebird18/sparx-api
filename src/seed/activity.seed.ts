import { Channel } from '../channels/entities/channel.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Activity } from 'src/activity/entities/activity.entity';
import { User } from 'src/users/entities/user.entity';

export async function seedActivity(AppDataSource) {
  const channelsRepository = AppDataSource.getRepository(Channel);
  const activityRepository = AppDataSource.getRepository(Activity);
  const userRepository = AppDataSource.getRepository(User);

  const workspacesRepository = AppDataSource.getRepository(Workspace);

  const workspace = await workspacesRepository.findOne({
    where: { name: 'Full Stack Development' },
  });

  const user = await userRepository.findOne({
    where: { email: 'aaron.whitebird@gmail.com' },
  });

  const channels = await channelsRepository.find();

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

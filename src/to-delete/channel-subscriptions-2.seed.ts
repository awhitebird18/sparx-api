import { Activity } from 'src/activity/entities/activity.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { DataSource } from 'typeorm';

export async function seedChannelSubscriptions(
  AppDataSource: DataSource,
  workspace: Workspace,
) {
  const channelsRepository = AppDataSource.getRepository(Channel);
  const activityRepository = AppDataSource.getRepository(Activity);
  const userWorkspacesRepository = AppDataSource.getRepository(UserWorkspace);
  const channelSubscriptionRepository =
    AppDataSource.getRepository(ChannelSubscription);

  if (!workspace) {
    console.error("Workspace 'Full Stack Development' not found");
    return;
  }

  const workspaceChannels = await channelsRepository.find({
    where: { workspace: { id: workspace.id } },
  });

  const workspaceUsers = await userWorkspacesRepository.find({
    where: { workspace: { id: workspace.id } },
    relations: ['user'],
    order: { user: { lastName: 'DESC' } },
  });

  const totalUsers = workspaceUsers.length;
  const totalChannels = workspaceChannels.length;

  const decrementStep = Math.ceil(totalUsers / totalChannels);

  let currentUserCount = totalUsers;

  for (const [, workspaceChannel] of workspaceChannels.entries()) {
    const usersToSubscribe = workspaceUsers.slice(
      0,
      Math.max(currentUserCount, 0),
    );

    for (const { user } of usersToSubscribe) {
      const channelSubscription = new ChannelSubscription();
      channelSubscription.channel = workspaceChannel;
      channelSubscription.user = user;
      await channelSubscriptionRepository.save(channelSubscription);

      const newActivity = activityRepository.create({
        user,
        workspace,
        text: `has joined the ${workspaceChannel.name} channel.`,
        type: 'user',
      });

      await activityRepository.save(newActivity);
    }

    currentUserCount -= decrementStep;
  }
}

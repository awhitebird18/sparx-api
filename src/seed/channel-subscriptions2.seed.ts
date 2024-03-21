import { Activity } from 'src/activity/entities/activity.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { DataSource } from 'typeorm';

export async function seedChannelSubscriptions(AppDataSource: DataSource) {
  const workspaceRepository = AppDataSource.getRepository(Workspace);
  const channelsRepository = AppDataSource.getRepository(Channel);
  const activityRepository = AppDataSource.getRepository(Activity);
  const userWorkspacesRepository = AppDataSource.getRepository(UserWorkspace);
  const channelSubscriptionRepository =
    AppDataSource.getRepository(ChannelSubscription);

  const workspace = await workspaceRepository.findOne({
    where: { name: 'Full Stack Development' },
  });

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
  });

  // Assuming you want the first channel to have all users and the last channel to have the least.
  const totalUsers = workspaceUsers.length;
  const totalChannels = workspaceChannels.length;

  // Determine the decrement step for users in each channel
  // For simplicity, this example evenly spreads users, adjust logic as needed for a different pattern
  const decrementStep = Math.ceil(totalUsers / totalChannels);

  let currentUserCount = totalUsers;

  for (const [index, workspaceChannel] of workspaceChannels.entries()) {
    // Calculate the number of users for this channel
    const usersToSubscribe = workspaceUsers.slice(
      0,
      Math.max(currentUserCount, 0),
    );

    // Create subscriptions for the selected users
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

    // Decrease the count for the next channel
    currentUserCount -= decrementStep;
  }
}

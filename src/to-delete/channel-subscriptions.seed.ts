import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { DataSource } from 'typeorm';

export async function seedChannelSubscriptions(AppDataSource: DataSource) {
  const workspaceRepository = AppDataSource.getRepository(Workspace);
  const channelsRepository = AppDataSource.getRepository(Channel);
  const userWorkspacesRepository = AppDataSource.getRepository(UserWorkspace);
  const channelSubscriptionRepository =
    AppDataSource.getRepository(ChannelSubscription);

  const workspaces = await workspaceRepository.find();

  const channelSubscriptions = [];

  for (const workspace of workspaces) {
    const workspaceChannels = await channelsRepository.find({
      where: { workspace: { id: workspace.id } },
    });

    const workspaceUsers = await userWorkspacesRepository.find({
      where: { workspace: { id: workspace.id } },
      relations: ['user'],
    });

    for (const workspaceChannel of workspaceChannels) {
      for (const workspaceUser of workspaceUsers) {
        const channelSubscription = new ChannelSubscription();
        channelSubscription.channel = workspaceChannel;
        channelSubscription.user = workspaceUser.user;

        channelSubscriptions.push(channelSubscription);
      }
    }
  }

  await channelSubscriptionRepository.insert(channelSubscriptions);
}

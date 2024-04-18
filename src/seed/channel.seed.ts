import { Channel } from '../channels/entities/channel.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import * as channelData from './output.json';

export async function seedChannels(AppDataSource, workspaceId: string) {
  const channelsRepository = AppDataSource.getRepository(Channel);

  const workspacesRepository = AppDataSource.getRepository(Workspace);

  const workspace = await workspacesRepository.findOne({
    where: { uuid: workspaceId },
  });

  const channels = [];

  const channelDataParsed = JSON.parse(JSON.stringify(channelData)).default;

  for (let i = 0; i < channelDataParsed.length; i++) {
    const newChannel = new Channel();

    newChannel.name = channelDataParsed[i].name;
    newChannel.x = Number(channelDataParsed[i].x);
    newChannel.y = Number(channelDataParsed[i].y);
    newChannel.isDefault =
      channelDataParsed[i].isDefault.toLowerCase() === 'true';
    newChannel.workspace = workspace;

    channels.push(newChannel);
  }

  await channelsRepository.insert(channels);
}

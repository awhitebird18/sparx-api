import { ChannelConnector } from 'src/channel-connectors/entities/channel-connector.entity';
import * as channelConnectorsData from './channel-connectors.json';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Channel } from 'src/channels/entities/channel.entity';

export async function seedChannelConnectors(AppDataSource) {
  const channelConnectorsRepository =
    AppDataSource.getRepository(ChannelConnector);
  const workspacesRepository = AppDataSource.getRepository(Workspace);
  const channelsRepository = AppDataSource.getRepository(Channel);

  const workspace = await workspacesRepository.findOne({
    where: { name: 'Full Stack Development' },
  });

  const channels = await channelsRepository.find();

  const channelConnectors = [];

  const channelDataParsed = JSON.parse(
    JSON.stringify(channelConnectorsData),
  ).default;

  for (let i = 0; i < channelDataParsed.length; i++) {
    const { childSide, parentSide, childChannelId, parentChannelId } =
      channelDataParsed[i];

    const childChannel = channels.find(
      (channel) => channel.id === +childChannelId,
    );
    const parentChannel = channels.find(
      (channel) => channel.id === +parentChannelId,
    );

    const newChannelConnector = channelConnectorsRepository.create({
      childSide,
      parentSide,
      workspace,
      childChannel,
      parentChannel,
    });

    channelConnectors.push(newChannelConnector);
  }

  await channelConnectorsRepository.insert(channelConnectors);
}

import { faker } from '@faker-js/faker';
import { Channel } from '../channels/entities/channel.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

export async function seedChannels(AppDataSource) {
  const channelsRepository = AppDataSource.getRepository(Channel);

  const workspacesRepository = AppDataSource.getRepository(Workspace);

  const workspaces = await workspacesRepository.find();
  const workspacesCount = workspaces.length - 1;

  const channels = [];

  for (let i = 0; i < 200; i++) {
    const newChannel = new Channel();

    newChannel.name = faker.word.noun();

    const randomIndex = Math.floor(Math.random() * workspacesCount);
    newChannel.workspace = workspaces[randomIndex];

    channels.push(newChannel);
  }

  await channelsRepository.insert(channels);
}

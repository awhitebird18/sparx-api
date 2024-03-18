import { faker } from '@faker-js/faker';
import { Channel } from '../channels/entities/channel.entity';
import { DataSource } from 'typeorm';
import { Message } from 'src/messages/entities/message.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';

export async function seedMessages(AppDataSource: DataSource) {
  const channelsRepository = AppDataSource.getRepository(Channel);
  const channelUsersRepository =
    AppDataSource.getRepository(ChannelSubscription);
  const messagesRepository = AppDataSource.getRepository(Message);

  const channels = await channelsRepository.find();

  const messages = [];

  for (const channel of channels) {
    const channelUsers = await channelUsersRepository.find({
      where: { channel: { id: channel.id } },
      relations: ['user'],
    });
    const channelUserCount = channelUsers.length - 1;

    const randomChannelMessageCount = Math.floor(Math.random() * 100);

    for (let i = 0; i < randomChannelMessageCount; i++) {
      const message = new Message();
      const randomUserIndex = Math.floor(Math.random() * channelUserCount);

      const user = channelUsers[randomUserIndex].user;

      message.content = faker.lorem.words({ min: 4, max: 40 });
      message.user = user;
      message.channel = channel;
      message.userId = user.uuid;
      message.channelId = channel.uuid;

      messages.push(message);
    }
  }

  await messagesRepository.insert(messages);
}

import { Channel } from '../channels/entities/channel.entity';
import { DataSource } from 'typeorm';
import { Message } from 'src/messages/entities/message.entity';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { http, internet } from './message-data';

export async function seedMessages(AppDataSource: DataSource) {
  const channelsRepository = AppDataSource.getRepository(Channel);
  const channelUsersRepository =
    AppDataSource.getRepository(ChannelSubscription);
  const messagesRepository = AppDataSource.getRepository(Message);

  const channels = await channelsRepository.find();

  const messages = [];

  const channelNamesToSeed = ['Internet', 'What is HTTP?'];

  for (const channel of channels) {
    if (!channelNamesToSeed.includes(channel.name)) continue;

    const channelUsers = await channelUsersRepository.find({
      where: { channel: { id: channel.id } },
      relations: ['user'],
    });
    const channelUserCount = channelUsers.length - 1;

    const messageCount = 10;

    for (let i = 0; i < messageCount; i++) {
      const message = new Message();
      const randomUserIndex = Math.floor(Math.random() * channelUserCount);

      const user = channelUsers[randomUserIndex - 1].user;
      const messageData = channel.name === 'Internet' ? internet : http;

      const jsonString = `{
        "root": {
          "children": [
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "${messageData[i]}",
                  "type": "text",
                  "version": 1
                }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1
            }
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1
        }
      }`;

      message.content = jsonString;
      message.user = user;
      message.channel = channel;
      message.userId = user.uuid;
      message.channelId = channel.uuid;

      messages.push(message);
    }
  }

  await messagesRepository.insert(messages);
}

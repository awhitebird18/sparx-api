import { Module } from '@nestjs/common';

import { ChannelGateway } from './channel.gateway';
import { OnlineStatusGateway } from './onlineStatus.gateway';
import { ChatGateway } from './chat.gateway';
import { UsersGateway } from './user.gateway';
import { SectionsGateway } from './section.gateway';

@Module({
  imports: [],
  providers: [
    ChannelGateway,
    OnlineStatusGateway,
    ChatGateway,
    UsersGateway,
    SectionsGateway,
  ],
  exports: [
    ChannelGateway,
    OnlineStatusGateway,
    ChatGateway,
    UsersGateway,
    SectionsGateway,
  ],
})
export class WebsocketsModule {}

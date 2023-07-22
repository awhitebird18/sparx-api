import { Module, forwardRef } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelsModule } from '../channels/channels.module';
import { OnlineStatusGateway } from './onlineStatus.gateway';
import { ChatGateway } from './chat.gateway';
import { UsersGateway } from './user.gateway';
import { SectionsGateway } from './section.gateway';

@Module({
  imports: [forwardRef(() => ChannelsModule)],
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

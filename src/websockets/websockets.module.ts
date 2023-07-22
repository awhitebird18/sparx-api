import { Module, forwardRef } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelsModule } from '../channels/channels.module';
import { OnlineStatusGateway } from './onlineStatus.gateway';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [forwardRef(() => ChannelsModule)],
  providers: [ChannelGateway, OnlineStatusGateway, ChatGateway],
  exports: [ChannelGateway, OnlineStatusGateway, ChatGateway],
})
export class WebsocketsModule {}

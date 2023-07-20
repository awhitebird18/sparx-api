import { Module, forwardRef } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelsModule } from '../channels/channels.module';
import { OnlineStatusGateway } from './onlineStatus.gateway';

@Module({
  imports: [forwardRef(() => ChannelsModule)],
  providers: [ChannelGateway, OnlineStatusGateway],
  exports: [ChannelGateway, OnlineStatusGateway],
})
export class WebsocketsModule {}

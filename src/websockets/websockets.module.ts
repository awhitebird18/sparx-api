import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [ChannelsModule],
  providers: [ChannelGateway],
  exports: [ChannelGateway],
})
export class WebsocketsModule {}

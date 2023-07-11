import { Module, forwardRef } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [forwardRef(() => ChannelsModule)],
  providers: [ChannelGateway],
  exports: [ChannelGateway],
})
export class WebsocketsModule {}

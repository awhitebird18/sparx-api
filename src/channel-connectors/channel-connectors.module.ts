import { Module } from '@nestjs/common';
import { ChannelConnectorsService } from './channel-connectors.service';
import { ChannelConnectorsController } from './channel-connectors.controller';
import { ChannelConnectorsRepository } from './channel-connectors.repository';
import { ChannelsModule } from 'src/channels/channels.module';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  imports: [ChannelsModule, WorkspacesModule],
  controllers: [ChannelConnectorsController],
  providers: [ChannelConnectorsService, ChannelConnectorsRepository],
  exports: [ChannelConnectorsService, ChannelConnectorsRepository],
})
export class ChannelConnectorsModule {}

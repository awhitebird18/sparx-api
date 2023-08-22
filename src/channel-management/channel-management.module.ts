import { Module } from '@nestjs/common';

import { ChannelManagementService } from './channel-management.service';
import { ChannelManagementController } from './channel-management.controller';

import { ChannelSubscriptionsModule } from 'src/channel-subscriptions/channel-subscriptions.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { UsersModule } from 'src/users/users.module';
import { SectionsModule } from 'src/sections/sections.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  imports: [
    ChannelSubscriptionsModule,
    ChannelsModule,
    UsersModule,
    SectionsModule,
    WebsocketsModule,
  ],
  controllers: [ChannelManagementController],
  providers: [ChannelManagementService],
})
export class ChannelManagementModule {}

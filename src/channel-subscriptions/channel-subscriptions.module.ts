import { Module, forwardRef } from '@nestjs/common';

import { ChannelSubscriptionsService } from './channel-subscriptions.service';
import { ChannelSubscriptionsController } from './channel-subscriptions.controller';
import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';

import { ChannelSubscription } from './entity/channel-subscription.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsModule } from 'src/sections/sections.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelSubscription]),
    forwardRef(() => SectionsModule),
    MessagesModule,
    WebsocketsModule,
  ],
  controllers: [ChannelSubscriptionsController],
  providers: [ChannelSubscriptionsService, ChannelSubscriptionsRepository],
  exports: [ChannelSubscriptionsService, ChannelSubscriptionsRepository],
})
export class ChannelSubscriptionsModule {}

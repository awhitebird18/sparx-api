import { Module, forwardRef } from '@nestjs/common';
import { ChannelSubscriptionsService } from './channel-subscriptions.service';
import { ChannelSubscriptionsController } from './channel-subscriptions.controller';
import { ChannelSubscriptionsRepository } from './channel-subscriptions.repository';
import { ChannelSubscription } from './entity/channel-subscription.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { SectionsModule } from 'src/sections/sections.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelSubscription]),
    forwardRef(() => UsersModule),
    forwardRef(() => SectionsModule),
    forwardRef(() => ChannelsModule),
    forwardRef(() => MessagesModule),
    WebsocketsModule,
  ],
  controllers: [ChannelSubscriptionsController],
  providers: [ChannelSubscriptionsService, ChannelSubscriptionsRepository],
  exports: [ChannelSubscriptionsService, ChannelSubscriptionsRepository],
})
export class ChannelSubscriptionsModule {}

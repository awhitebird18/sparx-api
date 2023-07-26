import { Module, forwardRef } from '@nestjs/common';
import { UserchannelsService } from './userchannels.service';
import { UserchannelsController } from './userchannels.controller';
import { UserChannelsRepository } from './userchannel.repository';
import { UserChannel } from './entity/userchannel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { SectionsModule } from 'src/sections/sections.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserChannel]),
    forwardRef(() => UsersModule),
    forwardRef(() => SectionsModule),
    forwardRef(() => ChannelsModule),
    forwardRef(() => MessagesModule),
    WebsocketsModule,
  ],
  controllers: [UserchannelsController],
  providers: [UserchannelsService, UserChannelsRepository],
  exports: [UserchannelsService, UserChannelsRepository],
})
export class UserchannelsModule {}

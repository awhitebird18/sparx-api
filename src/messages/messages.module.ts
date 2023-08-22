import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { ReactionRepository } from './reactions.repository';

import { Message } from './entities/message.entity';
import { Reaction } from './entities/reaction.entity';

import { ChannelsModule } from 'src/channels/channels.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Reaction]),
    ChannelsModule,
    WebsocketsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository, ReactionRepository],
  exports: [MessagesService, MessagesRepository],
})
export class MessagesModule {}

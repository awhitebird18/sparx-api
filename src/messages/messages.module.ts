import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesRepository } from './messages.repository';
import { ChannelsModule } from 'src/channels/channels.module';
import { UsersModule } from 'src/users/users.module';
import { Reaction } from './entities/reaction.entity';
import { ReactionRepository } from './reactions.repository';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Reaction]),
    ChannelsModule,
    UsersModule,
    WebsocketsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository, ReactionRepository],
})
export class MessagesModule {}

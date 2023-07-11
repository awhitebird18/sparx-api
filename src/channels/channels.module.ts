import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';

import { SectionsModule } from 'src/sections/sections.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    SectionsModule,
    WebsocketsModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsRepository],
})
export class ChannelsModule {}

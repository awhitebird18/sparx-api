import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';

import { WebsocketsModule } from 'src/websockets/websockets.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Channel]), WebsocketsModule, FilesModule],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsRepository],
  exports: [ChannelsService, ChannelsRepository],
})
export class ChannelsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';
import { SectionsModule } from 'src/sections/sections.module';
import { AssistantModule } from 'src/assistant/assistant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    WebsocketsModule,
    CloudinaryModule,
    SectionsModule,
    AssistantModule,
    forwardRef(() => WorkspacesModule),
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsRepository],
  exports: [ChannelsService, ChannelsRepository],
})
export class ChannelsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesRepository } from './workspaces.repository';
import { Workspace } from './entities/workspace.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]),
    CloudinaryModule,
    EventEmitterModule,
    forwardRef(() => ChannelsModule),
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspacesRepository],
  exports: [WorkspacesService, WorkspacesRepository],
})
export class WorkspacesModule {}

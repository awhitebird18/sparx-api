import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';

import { TasksController } from './tasks.controller';
import { TasksRepository } from './tasks.repository';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  imports: [WorkspacesModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}

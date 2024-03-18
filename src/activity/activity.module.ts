import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ActivtyRepository } from './acitivty.repository';
import { UsersModule } from 'src/users/users.module';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  imports: [UsersModule, WorkspacesModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivtyRepository],
})
export class ActivityModule {}

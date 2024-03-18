import { Module } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';
import { ExperienceRepository } from './experience.repository';
import { UsersModule } from 'src/users/users.module';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  imports: [UsersModule, WorkspacesModule],
  controllers: [ExperienceController],
  providers: [ExperienceService, ExperienceRepository],
  exports: [ExperienceService],
})
export class ExperienceModule {}

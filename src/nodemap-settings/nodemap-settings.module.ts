import { Module } from '@nestjs/common';
import { NodemapSettingsService } from './nodemap-settings.service';
import { NodemapSettingsController } from './nodemap-settings.controller';
import { NodemapSettingsRepository } from './nodemap-settings.repository';
import { NodemapSettings } from './entities/nodemap-setting.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  imports: [TypeOrmModule.forFeature([NodemapSettings]), WorkspacesModule],
  controllers: [NodemapSettingsController],
  providers: [NodemapSettingsService, NodemapSettingsRepository],
  exports: [NodemapSettingsService, NodemapSettingsRepository],
})
export class NodemapSettingsModule {}

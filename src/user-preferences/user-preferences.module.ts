import { Module } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferences } from './entities/user-preference.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencessRepository } from './user-preferences.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferences])],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService, UserPreferencessRepository],
  exports: [UserPreferencesService],
})
export class UserPreferencesModule {}

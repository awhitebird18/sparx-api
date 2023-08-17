import { Module } from '@nestjs/common';
import { UserpreferencesService } from './user-preferences.service';
import { UserpreferencesController } from './user-preferences.controller';
import { UserPreferences } from './entities/user-preference.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencessRepository } from './user-preferences.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferences])],
  controllers: [UserpreferencesController],
  providers: [UserpreferencesService, UserPreferencessRepository],
  exports: [UserpreferencesService],
})
export class UserpreferencesModule {}

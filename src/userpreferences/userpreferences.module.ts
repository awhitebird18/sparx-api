import { Module } from '@nestjs/common';
import { UserpreferencesService } from './userpreferences.service';
import { UserpreferencesController } from './userpreferences.controller';
import { Userpreferences } from './entities/userpreference.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencessRepository } from './userpreferences.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Userpreferences])],
  controllers: [UserpreferencesController],
  providers: [UserpreferencesService, UserPreferencessRepository],
  exports: [UserpreferencesService],
})
export class UserpreferencesModule {}

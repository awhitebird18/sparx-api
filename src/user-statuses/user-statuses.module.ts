import { Module } from '@nestjs/common';
import { UserStatusesService } from './user-statuses.service';
import { UserStatusesController } from './user-statuses.controller';
import { UserStatusesRepository } from './user-statuses.repository';
import { UserStatus } from './entities/user-status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserStatus])],
  controllers: [UserStatusesController],
  providers: [UserStatusesService, UserStatusesRepository],
  exports: [UserStatusesService, UserStatusesRepository],
})
export class UserStatusesModule {}

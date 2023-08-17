import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsModule } from 'src/sections/sections.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { UserpreferencesModule } from 'src/user-preferences/user-preferences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserpreferencesModule,
    forwardRef(() => SectionsModule),
    forwardRef(() => SectionsModule),
    forwardRef(() => WebsocketsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}

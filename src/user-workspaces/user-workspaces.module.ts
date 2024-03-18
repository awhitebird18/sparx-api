import { Module } from '@nestjs/common';
import { UserWorkspacesService } from './user-workspaces.service';
import { UserWorkspacesController } from './user-workspaces.controller';
import { UserWorkspacesRepository } from './user-workspace.repository';
import { UserWorkspace } from './entities/user-workspace.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';
import { UsersModule } from 'src/users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspace]),
    WorkspacesModule,
    UsersModule,
    MailerModule,
    JwtModule,
  ],
  controllers: [UserWorkspacesController],
  providers: [UserWorkspacesService, UserWorkspacesRepository],
  exports: [UserWorkspacesService, UserWorkspacesRepository],
})
export class UserWorkspacesModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SectionsModule } from './sections/sections.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { JwtAuthGuard } from './auth/guards/jwtAuthGuard.guard';
import { UserchannelsModule } from './userchannels/userchannels.module';
import { config } from './typeorm';
import { UserpreferencesModule } from './userpreferences/userpreferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(config),
    ChannelsModule,
    MessagesModule,
    CompaniesModule,
    SectionsModule,
    UsersModule,
    UserpreferencesModule,
    AuthModule,
    WebsocketsModule,
    UserchannelsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}

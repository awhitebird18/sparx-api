import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { SpacesModule } from './spaces/spaces.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SectionsModule } from './sections/sections.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { JwtAuthGuard } from './auth/jwtAuthGuard.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ChannelsModule,
    MessagesModule,
    SpacesModule,
    CompaniesModule,
    UsersModule,
    AuthModule,
    SectionsModule,
    WebsocketsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}

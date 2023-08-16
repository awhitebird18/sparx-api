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
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PreviewController } from './preview/preview.controller';
import * as path from 'path';
import * as Mailgun from 'nodemailer-mailgun-transport';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: Mailgun({
          auth: {
            api_key: '9b6217337067cd5b0c598fdb833cf73e-28e9457d-0b492e37',
            domain: 'sandboxf7ca4edf7c754e0ea531e2a5a5417899.mailgun.org',
          },
        }),
        preview: true,
        defaults: {
          from: '"Sparx" <no-reply@sparx.com>',
        },
        template: {
          dir: path.join(__dirname, '/templates'),
          adapter: new HandlebarsAdapter(undefined, { inlineCssEnabled: true }),
        },
      }),
    }),
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
  controllers: [AppController, PreviewController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}

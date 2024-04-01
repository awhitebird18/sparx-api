import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { config } from './typeorm';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import Mailgun from 'nodemailer-mailgun-transport';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { ChannelSubscriptionsModule } from './channel-subscriptions/channel-subscriptions.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { ChannelManagementModule } from './channel-management/channel-management.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SectionsModule } from './sections/sections.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { UserStatusesModule } from './user-statuses/user-statuses.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './config/pino-config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotesModule } from './notes/notes.module';
import { CardTemplateModule } from './card-template/card-template.module';
import { CardFieldModule } from './card-field/card-field.module';
import { CardTypeModule } from './card-type/card-type.module';
import { CardModule } from './card/card.module';
import { ReviewHistoryModule } from './review-history/review-history.module';
import { CardNoteModule } from './card-note/card-note.module';
import { CardFieldValueModule } from './card-field-value/card-field-value.module';
import { ChannelConnectorsModule } from './channel-connectors/channel-connectors.module';
import { UserWorkspacesModule } from './user-workspaces/user-workspaces.module';
import { NodemapSettingsModule } from './nodemap-settings/nodemap-settings.module';
import { TasksModule } from './tasks/tasks.module';
import { ExperienceModule } from './experience/experience.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    LoggerModule.forRoot(pinoConfig),
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    MailerModule.forRoot({
      transport: {
        host: 'in-v3.mailjet.com', // Mailjet SMTP server
        port: 587, // SMTP port (TLS)
        auth: {
          user: process.env.EMAIL_USER, // Replace with your Mailjet API Key
          pass: process.env.EMAIL_PASSWORD, // Replace with your Mailjet Secret Key
        },
      },
      preview: true,
      defaults: {
        from: '"Sparx" <no-reply@sparx.com>',
      },
      template: {
        dir: path.join(__dirname, '/templates'),
        adapter: new HandlebarsAdapter(undefined, { inlineCssEnabled: true }),
      },
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(config),
    ChannelsModule,
    MessagesModule,
    SectionsModule,
    UsersModule,
    UserPreferencesModule,
    AuthModule,
    WebsocketsModule,
    ChannelSubscriptionsModule,
    ChannelManagementModule,
    WorkspacesModule,
    UserStatusesModule,
    CloudinaryModule,
    NotesModule,
    CardTemplateModule,
    CardFieldModule,
    CardTypeModule,
    CardModule,
    ReviewHistoryModule,
    CardNoteModule,
    CardFieldValueModule,
    ChannelConnectorsModule,
    UserWorkspacesModule,
    NodemapSettingsModule,
    TasksModule,
    ExperienceModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ClassSerializerInterceptor,
    // },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { LocalStrategy } from './strategies/local.strategy';
import { RefreshJWTStrategy } from './strategies/refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UserPreferencesModule } from 'src/user-preferences/user-preferences.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { ChannelSubscriptionsModule } from 'src/channel-subscriptions/channel-subscriptions.module';
import { UsersModule } from 'src/users/users.module';
import { SectionsModule } from 'src/sections/sections.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserStatusesModule } from 'src/user-statuses/user-statuses.module';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    UsersModule,
    SectionsModule,
    ChannelSubscriptionsModule,
    ChannelsModule,
    PassportModule,
    UserPreferencesModule,
    MailerModule,
    UserStatusesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJWTStrategy],
  exports: [AuthService],
})
export class AuthModule {}

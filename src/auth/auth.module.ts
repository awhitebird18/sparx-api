import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { SectionsModule } from 'src/sections/sections.module';
import { ChannelSubscriptionsModule } from 'src/channel-subscriptions/channel-subscriptions.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { UserPreferencesModule } from 'src/user-preferences/user-preferences.module';
import { RefreshJWTStrategy } from './strategies/refresh.strategy';
import { MailerModule } from '@nestjs-modules/mailer';

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
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJWTStrategy],
  exports: [AuthService],
})
export class AuthModule {}

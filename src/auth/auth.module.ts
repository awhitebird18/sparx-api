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
import { UserchannelsModule } from 'src/userchannels/userchannels.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { UserpreferencesModule } from 'src/userpreferences/userpreferences.module';
import { RefreshJWTStrategy } from './strategies/refresh.strategy';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    UsersModule,
    SectionsModule,
    UserchannelsModule,
    ChannelsModule,
    PassportModule,
    UserpreferencesModule,
    MailerModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJWTStrategy],
  exports: [AuthService],
})
export class AuthModule {}

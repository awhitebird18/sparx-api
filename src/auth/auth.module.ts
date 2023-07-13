import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { SectionsModule } from 'src/sections/sections.module';
import { UserchannelsModule } from 'src/userchannels/userchannels.module';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [
    UsersModule,
    SectionsModule,
    UserchannelsModule,
    ChannelsModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10000s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

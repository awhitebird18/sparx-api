import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { SectionsModule } from 'src/sections/sections.module';
import { UserPreferencesModule } from 'src/user-preferences/user-preferences.module';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { jwtConstants } from 'src/auth/constants';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CardTemplateModule } from 'src/card-template/card-template.module';
import { CardFieldModule } from 'src/card-field/card-field.module';
import { CardVariantModule } from 'src/card-variant/card-variant.module';

@Module({
  imports: [
    CardFieldModule,
    CardVariantModule,
    CardTemplateModule,
    TypeOrmModule.forFeature([User]),
    UserPreferencesModule,
    SectionsModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    MailerModule,
    CloudinaryModule,
    EventEmitterModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}

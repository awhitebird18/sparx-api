import { Module } from '@nestjs/common';
import { UserchannelsService } from './userchannels.service';
import { UserchannelsController } from './userchannels.controller';
import { UserChannelsRepository } from './userchannel.repository';
import { UserChannel } from './entity/userchannel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserChannel]), UsersModule],
  controllers: [UserchannelsController],
  providers: [UserchannelsService, UserChannelsRepository],
  exports: [UserchannelsService, UserChannelsRepository],
})
export class UserchannelsModule {}

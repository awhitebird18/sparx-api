import { Module, forwardRef } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { SectionsRepository } from './sections.repository';
import { Section } from './entities/section.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelSubscriptionsModule } from 'src/channel-subscriptions/channel-subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    forwardRef(() => ChannelSubscriptionsModule),
  ],
  controllers: [SectionsController],
  providers: [SectionsService, SectionsRepository],
  exports: [SectionsService, SectionsRepository],
})
export class SectionsModule {}

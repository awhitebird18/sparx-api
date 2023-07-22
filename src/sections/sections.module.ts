import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { SectionsRepository } from './sections.repository';
import { Section } from './entities/section.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Section]), WebsocketsModule],
  controllers: [SectionsController],
  providers: [SectionsService, SectionsRepository],
  exports: [SectionsService, SectionsRepository],
})
export class SectionsModule {}

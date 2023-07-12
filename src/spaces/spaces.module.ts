import { Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { Space } from './entities/space.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Space])],
  controllers: [SpacesController],
  providers: [SpacesService],
})
export class SpacesModule {}

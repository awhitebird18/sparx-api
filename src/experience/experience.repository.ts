import { DataSource, Repository } from 'typeorm';
import { Experience } from './entities/experience.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExperienceRepository extends Repository<Experience> {
  constructor(private dataSource: DataSource) {
    super(Experience, dataSource.createEntityManager());
  }
}

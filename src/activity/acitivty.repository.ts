import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivtyRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }
}

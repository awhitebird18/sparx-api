import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { NodemapSettings } from './entities/nodemap-setting.entity';

@Injectable()
export class NodemapSettingsRepository extends Repository<NodemapSettings> {
  constructor(private dataSource: DataSource) {
    super(NodemapSettings, dataSource.createEntityManager());
  }
}

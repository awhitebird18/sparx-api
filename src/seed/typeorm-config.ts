import { DataSourceOptions, DefaultNamingStrategy } from 'typeorm';

export const options: DataSourceOptions = {
  type: 'postgres',
  host: '165.227.44.99',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  database: 'postgres',
  synchronize: true,
  namingStrategy: new DefaultNamingStrategy(),
  dropSchema: true,
};

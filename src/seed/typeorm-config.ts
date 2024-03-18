import { DataSourceOptions, DefaultNamingStrategy } from 'typeorm';

export const options: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  database: process.env.PG_DB,
  synchronize: true,
  namingStrategy: new DefaultNamingStrategy(),
  dropSchema: true,
};

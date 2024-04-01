import { DataSourceOptions, DefaultNamingStrategy } from 'typeorm';

export const getOptions = (isProd?: boolean) =>
  <DataSourceOptions>{
    type: 'postgres',
    host: isProd ? '165.227.44.99' : 'localhost', // Use 'db' here
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    database: 'postgres',
    synchronize: true,
    namingStrategy: new DefaultNamingStrategy(),
    dropSchema: true,
  };

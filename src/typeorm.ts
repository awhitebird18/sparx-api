import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DefaultNamingStrategy } from 'typeorm';

export const config: PostgresConnectionOptions = {
  type: process.env.DB_TYPE as any,
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  namingStrategy: new DefaultNamingStrategy(),
  dropSchema: true,
};

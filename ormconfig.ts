import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

let environment = 'development';
if (process.env.NODE_ENV) {
  environment = process.env.NODE_ENV;
}

const envConfig = dotenv.config({
  path: path.resolve(__dirname, `./src/configs/environments/${environment}.env`),
});

function env(key) {
  return envConfig.parsed[key] || process.env[key];
}

let connectionOptions;

if (['staging', 'production'].includes(environment)) {
  connectionOptions = {
    url: env('DATABASE_URL'),
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
} else {
  connectionOptions = {
    host: env('DB_HOST'),
    port: +env('DB_PORT'),
    username: env('DB_USERNAME'),
    password: env('DB_PASSWORD'),
    database: env('DB_NAME'),
  };
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...connectionOptions,
  // entities: ['./src/**/entities/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
  migrations: ['./src/database/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: true,
  timezone: 'Z',
});

export default {
  type: 'postgres',
  ...connectionOptions,
  // entities: ['./src/**/entities/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
  migrationsRun: true,
  seeders: ['./src/database/seeds/**/*{.ts,.js}'],
  factories: ['./src/database/factories/**/*{.ts,.js}'],
  migrations: ['./src/database/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  cli: {
    migrationsDir: './src/database/migrations',
  },
  extra: {
    ssl: false,
  },
  timezone: 'Z',
};

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (['staging', 'production'].includes(configService.get('NODE_ENV'))) {
          return {
            type: 'postgres',
            url: configService.get('DATABASE_URL'),
            ssl: true,
            autoLoadEntities: true,
            synchronize: false,
            logging: true,
            migrationsRun: true,
            migrations: ['dist/src/database/migrations/**/*{.ts,.js}'],
            entities: ['dist/src/**/entities/*.entity.*{.ts,.js}'],
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          };
        }
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          url: configService.get('DB_URL'),
          database: configService.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,
          logging: true,
          migrationsRun: true,
          migrations: ['dist/src/database/migrations/**/*{.ts,.js}'],
          entities: ['dist/src/**/entities/*.entity.*{.ts,.js}'],
        };
      },
    }),
  ],
})
export class DatabaseModule {}

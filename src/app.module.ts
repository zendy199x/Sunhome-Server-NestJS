import { AuthModule } from '@/auth/auth.module';
import configuration from '@/configs/configuration';
import { DatabaseModule } from '@/database/sql/database.module';
import { FileModule } from '@/file/file.module';
import { MissionModule } from '@/mission/mission.module';
import { ProjectModule } from '@/project/project.module';
import { configValidationSchema } from '@/schemas/config.schema';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `src/configs/environments/${process.env.NODE_ENV}.env`,
      validationSchema: configValidationSchema,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    FileModule,
    MissionModule,
    ProjectModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

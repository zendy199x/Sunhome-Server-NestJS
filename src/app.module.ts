import configuration from '@/configs/configuration';
import { configValidationSchema } from '@/schemas/config.schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `src/configs/environments/${process.env.NODE_ENV}.env`,
      validationSchema: configValidationSchema,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}

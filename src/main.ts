import { AppModule } from '@/app.module';
import { TransformInterceptor } from '@/interceptors/transform.interceptor';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { config } from 'aws-sdk';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  const configService = app.get<ConfigService>(ConfigService);

  Sentry.init({
    dsn: process.env.SENTRY_DNS,
  });

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  const configSwagger = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Sun Home API Document')
    .setDescription('Sun Home API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get('PORT') ?? 8080;

  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();

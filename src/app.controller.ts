import { SentryInterceptor } from '@/interceptors/sentry.interceptor';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

@UseInterceptors(SentryInterceptor)
@Controller('/')
export class AppController {
  constructor() {}

  @Get('/')
  healthCheck() {
    return 'Ok';
  }
}

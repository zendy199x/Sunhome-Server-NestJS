import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context?.switchToHttp()?.getResponse()?.statusCode,
        message: data?.message ?? 'success',
        data: instanceToPlain(data),
      }))
    );
  }
}

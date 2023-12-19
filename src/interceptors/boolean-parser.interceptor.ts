import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class BooleanParserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const booleanFields = ['isVerified', 'isCustomize'];
    const request = context.switchToHttp().getRequest();
    booleanFields.forEach((fieldName) => {
      if (fieldName === 'isCustomize') {
        // Check if the query param exists and is 'true', then set it to true
        if (request.query[fieldName] === 'true') {
          request.query[fieldName] = true;
        } else if (request.query[fieldName] === 'false') {
          request.query[fieldName] = false;
        }
      } else {
        // For other boolean fields, check the request body
        if (request.body[fieldName] === 'true') {
          request.body[fieldName] = true;
        } else if (request.body[fieldName] === 'false') {
          request.body[fieldName] = false;
        }
      }
    });
    return next.handle().pipe(
      tap((data) => {
        // Handle response data if needed
      })
    );
  }
}

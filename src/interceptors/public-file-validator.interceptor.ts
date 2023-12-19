import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PublicFileValidatorInterceptor implements NestInterceptor {
  constructor(
    private readonly allowedFileTypes: RegExp[],
    private readonly errorMessage: string,
    private readonly isFileRequired: boolean
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const file = context.switchToHttp().getRequest().file;

    if (!file && !this.isFileRequired) {
      return next.handle();
    }

    if (!file && this.isFileRequired) {
      throw new BadRequestException('File is required.');
    }

    const fileTypeIsValid = this.allowedFileTypes.some((regex) => regex.test(file.mimetype));

    if (!fileTypeIsValid) {
      throw new BadRequestException(this.errorMessage);
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      })
    );
  }
}

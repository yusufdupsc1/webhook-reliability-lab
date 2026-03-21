import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        this.logger.error(
          `Error in ${context.getClass().name}: ${error.message}`,
          error.stack,
        );
        return throwError(() => error);
      }),
    );
  }
}

import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ParseDataFieldInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const raw = req.body?.data;

    if (typeof raw !== 'string') {
      throw new BadRequestException('Data field is required');
    }
    try {
      req.body = JSON.parse(raw);
    } catch {
      throw new BadRequestException('data must be valid JSON');
    }
    return next.handle();
  }
}

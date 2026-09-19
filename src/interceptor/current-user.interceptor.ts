import { UsersService } from 'src/users/users.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class CurrentUserInterceptor {
  constructor(private userService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const email = req.user?.email;

    if (email) {
      req.currentUser = await this.userService.findByEmail(email); // 1
    }

    return next.handle(); // 2
  }
}

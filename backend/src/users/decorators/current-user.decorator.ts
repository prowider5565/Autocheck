import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from '../users.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Users | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: Users }>();

    return request.user;
  },
);

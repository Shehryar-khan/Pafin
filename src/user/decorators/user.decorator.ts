// user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/user.entity'; // Assuming you have a User interface

export const GetUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest();
    return request.user; // Assuming user information is stored in the request object
  },
);

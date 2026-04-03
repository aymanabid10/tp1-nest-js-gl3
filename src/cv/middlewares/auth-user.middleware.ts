import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, decode } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId: number;
}

@Injectable()
export class AuthUserMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const token = req.header('auth-user');

    if (!token) {
      throw new UnauthorizedException('Missing auth-user header');
    }

    const decoded = decode(token);

    if (!this.hasUserId(decoded)) {
      throw new UnauthorizedException('Invalid auth-user token');
    }

    const userId = Number(decoded.userId);

    if (Number.isNaN(userId)) {
      throw new UnauthorizedException('Invalid auth-user token');
    }

    (req as AuthenticatedRequest).userId = userId;
    next();
  }

  private hasUserId(
    payload: string | JwtPayload | null,
  ): payload is JwtPayload & { userId: unknown } {
    return (
      payload !== null &&
      typeof payload === 'object' &&
      Object.prototype.hasOwnProperty.call(payload, 'userId')
    );
  }
}

import { Request } from 'express';
import { PayloadInterface } from './payload.interface';

export interface AuthenticatedRequest extends Request {
  user: PayloadInterface;
}

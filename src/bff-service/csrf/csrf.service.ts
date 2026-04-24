import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  validateToken(token: string, sessionToken: string): boolean {
    return !!(token && sessionToken && token === sessionToken);
  }
}

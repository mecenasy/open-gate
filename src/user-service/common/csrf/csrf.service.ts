import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  async generateToken(): Promise<string> {
    const randomString = randomBytes(32).toString('hex');
    return await bcrypt.hash(randomString, 10);
  }

  validateToken(token: string, sessionToken: string): boolean {
    return !!(token && sessionToken && token === sessionToken);
  }
}

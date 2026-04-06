import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  constructor() {}
  public generateOtp(digits: number = 6): number {
    if (digits < 1) throw new Error('OTP must be at least 1 digit long');

    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    return Math.floor(min + Math.random() * (max - min + 1));
  }

  public generateToken(): string {
    return uuid();
  }
}

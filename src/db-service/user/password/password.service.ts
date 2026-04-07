import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { IPassword } from './model/password.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Password } from './entity/password.entity';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(Password)
    private readonly repository: Repository<Password>,
  ) {}

  public createPassword(password: string = 'Pass123#'): IPassword {
    const { salt, hash } = this.generatePassword(password);
    return this.repository.create({ salt, hash });
  }

  public validatePassword(password: string, { salt, hash }: IPassword): boolean {
    const hashVerify = bcrypt.hashSync(password, salt);

    return hashVerify === hash;
  }

  private generatePassword(password: string): IPassword {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    return {
      salt,
      hash,
    };
  }
}

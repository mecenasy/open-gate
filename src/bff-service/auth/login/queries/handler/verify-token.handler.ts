import { QueryHandler } from '@nestjs/cqrs';
import { VerifyTokenQuery } from '../impl/verify-token.query';
import { BadRequestException } from '@nestjs/common';
import { Handler } from '@app/handler';
import { VerifyTokenType } from '../../dto/verify-token.type';

@QueryHandler(VerifyTokenQuery)
export class VerifyTokensHandler extends Handler<VerifyTokenQuery, VerifyTokenType> {
  constructor() {
    super();
  }

  async execute({ token }: VerifyTokenQuery) {
    const exist = await this.cache.checkExistsInCache({
      identifier: token,
      prefix: 'forgot-password',
    });

    if (!exist) {
      throw new BadRequestException('Invalid token');
    }

    return {
      verify: true,
    };
  }
}

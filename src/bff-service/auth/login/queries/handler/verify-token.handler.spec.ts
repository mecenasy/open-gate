import { BadRequestException, Logger } from '@nestjs/common';
import { VerifyTokensHandler } from './verify-token.handler';
import { VerifyTokenQuery } from '../impl/verify-token.query';
import { CacheService } from '@app/redis';

describe('VerifyTokensHandler', () => {
  let handler: VerifyTokensHandler;
  let mockCache: jest.Mocked<Pick<CacheService, 'checkExistsInCache'>>;

  beforeEach(() => {
    mockCache = { checkExistsInCache: jest.fn() };

    handler = new VerifyTokensHandler();
    Object.assign(handler, {
      cache: mockCache,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should return verify=true when token exists in cache', async () => {
    mockCache.checkExistsInCache.mockResolvedValue(true);

    const result = await handler.execute(new VerifyTokenQuery('valid-token'));

    expect(result).toEqual({ verify: true });
    expect(mockCache.checkExistsInCache).toHaveBeenCalledWith({
      identifier: 'valid-token',
      prefix: 'forgot-password',
    });
  });

  it('should throw BadRequestException when token does not exist in cache', async () => {
    mockCache.checkExistsInCache.mockResolvedValue(false);

    await expect(handler.execute(new VerifyTokenQuery('expired-token'))).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException with "Invalid token" message', async () => {
    mockCache.checkExistsInCache.mockResolvedValue(false);

    await expect(handler.execute(new VerifyTokenQuery('expired-token'))).rejects.toThrow('Invalid token');
  });
});

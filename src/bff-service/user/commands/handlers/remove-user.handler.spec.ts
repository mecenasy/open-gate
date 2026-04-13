import { of } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { RemoveUserHandler } from './remove-user.handler';
import { RemoveUserCommand } from '../impl/remove-user.command';
import { CacheService } from '@app/redis';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

describe('RemoveUserHandler', () => {
  let handler: RemoveUserHandler;
  let mockGrpc: { removeUser: jest.Mock };
  let mockCache: jest.Mocked<Pick<CacheService, 'removeFromCache'>>;

  beforeEach(() => {
    mockGrpc = { removeUser: jest.fn() };
    mockCache = { removeFromCache: jest.fn().mockResolvedValue(undefined) };

    handler = new RemoveUserHandler();
    Object.assign(handler, { gRpcService: mockGrpc, cache: mockCache, logger: mockLogger });
  });

  it('should return success:true when user is removed', async () => {
    mockGrpc.removeUser.mockReturnValue(of({ status: true }));

    const result = await handler.execute(new RemoveUserCommand('user-1'));

    expect(result).toEqual({ success: true });
    expect(mockCache.removeFromCache).toHaveBeenCalledWith({ identifier: 'user-1', prefix: 'user' });
  });

  it('should throw BadRequestException when gRPC returns status=false', async () => {
    mockGrpc.removeUser.mockReturnValue(of({ status: false, message: 'User not found' }));

    await expect(handler.execute(new RemoveUserCommand('bad-id'))).rejects.toThrow(BadRequestException);
    expect(mockCache.removeFromCache).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when response is null', async () => {
    mockGrpc.removeUser.mockReturnValue(of(null));

    await expect(handler.execute(new RemoveUserCommand('user-1'))).rejects.toThrow(BadRequestException);
  });
});

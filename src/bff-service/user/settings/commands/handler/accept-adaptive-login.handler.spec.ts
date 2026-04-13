import { of } from 'rxjs';
import { AcceptAdaptiveLoginHandler } from './accept-adaptive-login.handler';
import { AcceptAdaptiveLoginCommand } from '../impl/accept-adaptive-login.command';
import { CacheService } from '@app/redis';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

describe('AcceptAdaptiveLoginHandler', () => {
  let handler: AcceptAdaptiveLoginHandler;
  let mockGrpc: { acceptAdaptive: jest.Mock };
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache' | 'saveInCache'>>;

  beforeEach(() => {
    mockGrpc = { acceptAdaptive: jest.fn() };
    mockCache = {
      getFromCache: jest.fn().mockResolvedValue(null),
      saveInCache: jest.fn().mockResolvedValue(undefined),
    };

    handler = new AcceptAdaptiveLoginHandler();
    Object.assign(handler, { gRpcService: mockGrpc, cache: mockCache, logger: mockLogger });
  });

  it('should return active=true when gRPC enables adaptive login', async () => {
    mockGrpc.acceptAdaptive.mockReturnValue(of({ active: true }));

    const result = await handler.execute(new AcceptAdaptiveLoginCommand('user-1'));

    expect(result).toEqual({ active: true });
  });

  it('should return active=false when gRPC disables adaptive login', async () => {
    mockGrpc.acceptAdaptive.mockReturnValue(of({ active: false }));

    const result = await handler.execute(new AcceptAdaptiveLoginCommand('user-1'));

    expect(result).toEqual({ active: false });
  });

  it('should update user-state cache with new isAdaptiveLoginEnabled value', async () => {
    mockGrpc.acceptAdaptive.mockReturnValue(of({ active: true }));
    mockCache.getFromCache.mockResolvedValue({
      id: 'user-1',
      email: 'u@e.com',
      isAdaptiveLoginEnabled: false,
      admin: false,
      owner: false,
      is2faEnabled: false,
    });

    await handler.execute(new AcceptAdaptiveLoginCommand('user-1'));

    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isAdaptiveLoginEnabled: true }),
        prefix: 'user-state',
        EX: 3600,
      }),
    );
  });

  it('should NOT update cache when user-state is not cached', async () => {
    mockGrpc.acceptAdaptive.mockReturnValue(of({ active: true }));
    mockCache.getFromCache.mockResolvedValue(null);

    await handler.execute(new AcceptAdaptiveLoginCommand('user-1'));

    expect(mockCache.saveInCache).not.toHaveBeenCalled();
  });
});

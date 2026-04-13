import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdHandler } from './get-user-by-id.handler';
import { GetUserByIdQuery } from '../impl/get-user-by-id.query';
import { CacheService } from '@app/redis';
import { Status, UserType as ProtoUserType } from 'src/proto/user';
import { UserType as JsUserType } from 'src/db-service/user/user-type';
import { UserStatus } from 'src/db-service/user/status';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

const protoUser = {
  id: 'user-1',
  email: 'jan@example.com',
  phone: '+48100200300',
  name: 'Jan',
  surname: 'Kowalski',
  status: Status.ACTIVE,
  type: ProtoUserType.USER,
};

const expectedUser = {
  id: 'user-1',
  email: 'jan@example.com',
  phone: '+48100200300',
  name: 'Jan',
  surname: 'Kowalski',
  status: UserStatus.Active,
  type: JsUserType.User,
};

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;
  let mockGrpc: { getUser: jest.Mock };
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache' | 'saveInCache'>>;

  beforeEach(() => {
    mockGrpc = { getUser: jest.fn() };
    mockCache = {
      getFromCache: jest.fn().mockResolvedValue(null),
      saveInCache: jest.fn().mockResolvedValue(undefined),
    };

    handler = new GetUserByIdHandler();
    Object.assign(handler, { gRpcService: mockGrpc, cache: mockCache, logger: mockLogger });
  });

  it('should return cached user without calling gRPC', async () => {
    mockCache.getFromCache.mockResolvedValue(expectedUser);

    const result = await handler.execute(new GetUserByIdQuery('user-1'));

    expect(result).toEqual(expectedUser);
    expect(mockGrpc.getUser).not.toHaveBeenCalled();
  });

  it('should fetch from gRPC, map and cache when cache is empty', async () => {
    mockGrpc.getUser.mockReturnValue(of({ status: true, data: protoUser }));

    const result = await handler.execute(new GetUserByIdQuery('user-1'));

    expect(result).toEqual(expectedUser);
    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'user-1', prefix: 'user', EX: 3600 }),
    );
  });

  it('should throw NotFoundException when gRPC returns no data', async () => {
    mockGrpc.getUser.mockReturnValue(of({ status: false, message: 'not found' }));

    await expect(handler.execute(new GetUserByIdQuery('bad-id'))).rejects.toThrow(NotFoundException);
  });

  it('should look up cache with correct prefix and identifier', async () => {
    mockGrpc.getUser.mockReturnValue(of({ status: true, data: protoUser }));

    await handler.execute(new GetUserByIdQuery('user-1'));

    expect(mockCache.getFromCache).toHaveBeenCalledWith({ identifier: 'user-1', prefix: 'user' });
  });
});

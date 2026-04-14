import { of } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from '../impl/create-user.command';
import { CacheService } from '@app/redis';
import { UserType as ProtoUserType } from 'src/proto/user';
import { UserType as JsUserType } from 'src/db-service/user/user-type';

const mockUser = {
  email: 'new@example.com',
  phone: '+48100200300',
  name: 'Jan',
  surname: 'Kowalski',
  type: JsUserType.User,
};

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let mockGrpc: { checkExist: jest.Mock; addUser: jest.Mock };
  let mockCache: jest.Mocked<Pick<CacheService, 'saveInCache'>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGrpc = { checkExist: jest.fn(), addUser: jest.fn() };
    mockCache = { saveInCache: jest.fn().mockResolvedValue(undefined) };

    handler = new CreateUserHandler();
    Object.assign(handler, { gRpcService: mockGrpc, cache: mockCache, logger: mockLogger });
  });

  it('should throw BadRequestException when user already exists', async () => {
    mockGrpc.checkExist.mockReturnValue(of({ exist: true }));

    await expect(handler.execute(new CreateUserCommand(mockUser))).rejects.toThrow(BadRequestException);
    expect(mockGrpc.addUser).not.toHaveBeenCalled();
  });

  it('should return id and email on successful creation', async () => {
    mockGrpc.checkExist.mockReturnValue(of({ exist: false }));
    mockGrpc.addUser.mockReturnValue(of({ status: true, data: { id: 'user-1', email: 'new@example.com' } }));

    const result = await handler.execute(new CreateUserCommand(mockUser));

    expect(result).toEqual({ id: 'user-1', email: 'new@example.com' });
  });

  it('should throw BadRequestException when addUser returns status=false', async () => {
    mockGrpc.checkExist.mockReturnValue(of({ exist: false }));
    mockGrpc.addUser.mockReturnValue(of({ status: false, message: 'DB error' }));

    await expect(handler.execute(new CreateUserCommand(mockUser))).rejects.toThrow(BadRequestException);
  });

  it('should cache the new user after creation', async () => {
    const userData = { id: 'user-1', email: 'new@example.com' };
    mockGrpc.checkExist.mockReturnValue(of({ exist: false }));
    mockGrpc.addUser.mockReturnValue(of({ status: true, data: userData }));

    await handler.execute(new CreateUserCommand(mockUser));

    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'user-1', prefix: 'user', EX: 3600 }),
    );
  });

  it('should convert JS UserType to Proto UserType when calling addUser', async () => {
    mockGrpc.checkExist.mockReturnValue(of({ exist: false }));
    mockGrpc.addUser.mockReturnValue(of({ status: true, data: { id: 'u1', email: 'x@x.com' } }));

    await handler.execute(new CreateUserCommand(mockUser));

    expect(mockGrpc.addUser).toHaveBeenCalledWith(expect.objectContaining({ type: ProtoUserType.USER }));
  });
});

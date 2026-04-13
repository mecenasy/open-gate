import { of } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { GetAllUsersHandler } from './get-all-users.handler';
import { GetAllUsersQuery } from '../impl/get-all-users.query';
import { Status, UserType as ProtoUserType } from 'src/proto/user';
import { UserType as JsUserType } from 'src/db-service/user/user-type';
import { UserStatus } from 'src/db-service/user/status';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

const protoUsers = [
  {
    id: 'u1',
    email: 'a@example.com',
    phone: '+1',
    name: 'Alice',
    surname: 'A',
    status: Status.ACTIVE,
    type: ProtoUserType.USER,
  },
  {
    id: 'u2',
    email: 'b@example.com',
    phone: '+2',
    name: 'Bob',
    surname: 'B',
    status: Status.PENDING,
    type: ProtoUserType.ADMIN,
  },
];

describe('GetAllUsersHandler', () => {
  let handler: GetAllUsersHandler;
  let mockGrpc: { getAllUsers: jest.Mock };

  beforeEach(() => {
    mockGrpc = { getAllUsers: jest.fn() };
    handler = new GetAllUsersHandler();
    Object.assign(handler, { gRpcService: mockGrpc, logger: mockLogger });
  });

  it('should return mapped users list with total', async () => {
    mockGrpc.getAllUsers.mockReturnValue(of({ status: true, data: protoUsers, total: 2 }));

    const result = await handler.execute(new GetAllUsersQuery(1, 10));

    expect(result.total).toBe(2);
    expect(result.users).toHaveLength(2);
    expect(result.users[0]).toMatchObject({
      id: 'u1',
      email: 'a@example.com',
      status: UserStatus.Active,
      type: JsUserType.User,
    });
    expect(result.users[1]).toMatchObject({
      status: UserStatus.Pending,
      type: JsUserType.Admin,
    });
  });

  it('should throw InternalServerErrorException when gRPC returns status=false', async () => {
    mockGrpc.getAllUsers.mockReturnValue(of({ status: false, message: 'DB error' }));

    await expect(handler.execute(new GetAllUsersQuery())).rejects.toThrow(InternalServerErrorException);
  });

  it('should pass page and limit to gRPC', async () => {
    mockGrpc.getAllUsers.mockReturnValue(of({ status: true, data: [], total: 0 }));

    await handler.execute(new GetAllUsersQuery(3, 25));

    expect(mockGrpc.getAllUsers).toHaveBeenCalledWith({ page: 3, limit: 25 });
  });
});

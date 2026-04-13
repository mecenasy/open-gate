import { of } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { GetAllCommandsHandler } from './get-all-commands.handler';
import { GetAllCommandsQuery } from '../impl/get-all-commands.query';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

const protoCommands = [
  {
    id: 'c1',
    name: 'deploy',
    description: 'Deploy',
    active: true,
    actions: ['execute'],
    parameters: [],
    command: 'kubectl apply',
    roleNames: ['admin'],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

describe('GetAllCommandsHandler', () => {
  let handler: GetAllCommandsHandler;
  let mockGrpc: { getAllCommands: jest.Mock };

  beforeEach(() => {
    mockGrpc = { getAllCommands: jest.fn() };
    handler = new GetAllCommandsHandler();
    Object.assign(handler, { gRpcService: mockGrpc, logger: mockLogger });
  });

  it('should return mapped commands list', async () => {
    mockGrpc.getAllCommands.mockReturnValue(
      of({ status: true, data: protoCommands, total: 1, page: 1, limit: 10 }),
    );

    const result = await handler.execute(new GetAllCommandsQuery(1, 10));

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('c1');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should throw InternalServerErrorException when status=false', async () => {
    mockGrpc.getAllCommands.mockReturnValue(of({ status: false, message: 'DB error' }));

    await expect(handler.execute(new GetAllCommandsQuery())).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should pass filters to gRPC', async () => {
    mockGrpc.getAllCommands.mockReturnValue(
      of({ status: true, data: [], total: 0, page: 1, limit: 5 }),
    );

    await handler.execute(new GetAllCommandsQuery(2, 5, true, { execute: true }));

    expect(mockGrpc.getAllCommands).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5, activeOnly: true, actionFilter: { execute: true } }),
    );
  });

  it('should use empty object as default actionFilter', async () => {
    mockGrpc.getAllCommands.mockReturnValue(
      of({ status: true, data: [], total: 0, page: 1, limit: 10 }),
    );

    await handler.execute(new GetAllCommandsQuery(1, 10, false));

    expect(mockGrpc.getAllCommands).toHaveBeenCalledWith(
      expect.objectContaining({ actionFilter: {} }),
    );
  });
});

import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { GetCommandHandler } from './get-command.handler';
import { GetCommandQuery } from '../impl/get-command.query';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

const protoCommand = {
  id: 'cmd-1',
  name: 'deploy',
  description: 'Deploy service',
  active: true,
  actions: ['execute'],
  parameters: [],
  command: 'kubectl apply',
  roleNames: ['admin'],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('GetCommandHandler', () => {
  let handler: GetCommandHandler;
  let mockGrpc: { getCommand: jest.Mock };

  beforeEach(() => {
    mockGrpc = { getCommand: jest.fn() };
    handler = new GetCommandHandler();
    Object.assign(handler, { gRpcService: mockGrpc, logger: mockLogger });
  });

  it('should return mapped command on success', async () => {
    mockGrpc.getCommand.mockReturnValue(of({ status: true, data: protoCommand }));

    const result = await handler.execute(new GetCommandQuery({ id: 'cmd-1' }));

    expect(result.data?.id).toBe('cmd-1');
    expect(result.data?.name).toBe('deploy');
    expect(result.data?.roleNames).toEqual(['admin']);
  });

  it('should throw NotFoundException when no data is returned', async () => {
    mockGrpc.getCommand.mockReturnValue(of({ status: false, message: 'Not found', data: null }));

    await expect(handler.execute(new GetCommandQuery({ id: 'bad-id' }))).rejects.toThrow(NotFoundException);
  });

  it('should pass id and name to gRPC', async () => {
    mockGrpc.getCommand.mockReturnValue(of({ status: true, data: protoCommand }));

    await handler.execute(new GetCommandQuery({ id: 'cmd-1', name: 'deploy' }));

    expect(mockGrpc.getCommand).toHaveBeenCalledWith({ id: 'cmd-1', name: 'deploy' });
  });
});

import { of } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { AddCommandHandler } from './add-command.handler';
import { AddCommandCommand } from '../impl/add-command.command';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

const inputFixture = {
  name: 'deploy',
  description: 'Deploy service',
  command: 'kubectl apply',
  actions: ['read', 'execute'],
  parameters: [],
  roleNames: ['admin'],
};

const dataFixture = {
  id: 'cmd-1',
  name: 'deploy',
  description: 'Deploy service',
  active: true,
  actions: ['read', 'execute'],
  command: 'kubectl apply',
  parameters: [],
  roleNames: ['admin'],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('AddCommandHandler', () => {
  let handler: AddCommandHandler;
  let mockGrpc: { addCommand: jest.Mock };

  beforeEach(() => {
    mockGrpc = { addCommand: jest.fn() };
    handler = new AddCommandHandler();
    Object.assign(handler, { gRpcService: mockGrpc, logger: mockLogger });
  });

  it('should return mapped CommandResponseType on success', async () => {
    mockGrpc.addCommand.mockReturnValue(of({ status: true, message: null, data: dataFixture }));

    const result = await handler.execute(new AddCommandCommand(inputFixture));

    expect(result.status).toBe(true);
    expect(result.data?.id).toBe('cmd-1');
    expect(result.data?.name).toBe('deploy');
  });

  it('should throw BadRequestException when status=false', async () => {
    mockGrpc.addCommand.mockReturnValue(of({ status: false, message: 'Duplicate name' }));

    await expect(handler.execute(new AddCommandCommand(inputFixture))).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException with gRPC message', async () => {
    mockGrpc.addCommand.mockReturnValue(of({ status: false, message: 'DUPLICATE_COMMAND' }));

    await expect(handler.execute(new AddCommandCommand(inputFixture))).rejects.toThrow('DUPLICATE_COMMAND');
  });

  it('should pass all input fields to gRPC', async () => {
    mockGrpc.addCommand.mockReturnValue(of({ status: true, data: dataFixture }));

    await handler.execute(new AddCommandCommand(inputFixture));

    expect(mockGrpc.addCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'deploy',
        command: 'kubectl apply',
        actions: ['read', 'execute'],
        roleNames: ['admin'],
      }),
    );
  });

  it('should handle response with no data field', async () => {
    mockGrpc.addCommand.mockReturnValue(of({ status: true, message: 'ok', data: undefined }));

    const result = await handler.execute(new AddCommandCommand(inputFixture));

    expect(result.data).toBeUndefined();
  });
});

import { of } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { RemoveCommandHandler } from './remove-command.handler';
import { RemoveCommandCommand } from '../impl/remove-command.command';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

describe('RemoveCommandHandler', () => {
  let handler: RemoveCommandHandler;
  let mockGrpc: { removeCommand: jest.Mock };

  beforeEach(() => {
    mockGrpc = { removeCommand: jest.fn() };
    handler = new RemoveCommandHandler();
    Object.assign(handler, { gRpcService: mockGrpc, logger: mockLogger });
  });

  it('should return success response when command is removed', async () => {
    mockGrpc.removeCommand.mockReturnValue(of({ status: true, message: null }));

    const result = await handler.execute(new RemoveCommandCommand('cmd-1'));

    expect(result.status).toBe(true);
    expect(mockGrpc.removeCommand).toHaveBeenCalledWith({ id: 'cmd-1' });
  });

  it('should throw BadRequestException when status=false', async () => {
    mockGrpc.removeCommand.mockReturnValue(of({ status: false, message: 'Not found' }));

    await expect(handler.execute(new RemoveCommandCommand('bad-id'))).rejects.toThrow(BadRequestException);
  });
});

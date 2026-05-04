import { of, throwError } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import type { BffNotifyBridgeClient } from 'src/proto/bff';
import { VerificationForwarderService } from './verification-forwarder.service';

describe('VerificationForwarderService', () => {
  let bff: jest.Mocked<BffNotifyBridgeClient>;
  let grpc: jest.Mocked<ClientGrpc>;
  let svc: VerificationForwarderService;

  beforeEach(() => {
    bff = { forwardVerificationCode: jest.fn() } as unknown as jest.Mocked<BffNotifyBridgeClient>;
    grpc = { getService: jest.fn().mockReturnValue(bff) } as unknown as jest.Mocked<ClientGrpc>;
    svc = new VerificationForwarderService(grpc);
    svc.onModuleInit();
    jest
      .spyOn((svc as unknown as { logger: { log: jest.Mock; error: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
    jest
      .spyOn((svc as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  it('resolves the BffNotifyBridge service handle on init', () => {
    expect(grpc.getService).toHaveBeenCalledWith('BffNotifyBridge');
  });

  it('forwards code/source/phone to BFF on success', async () => {
    bff.forwardVerificationCode.mockReturnValue(of({ status: true }) as never);

    await svc.forward('+48111', '123456', 'signal');

    expect(bff.forwardVerificationCode).toHaveBeenCalledWith({
      phoneE164: '+48111',
      code: '123456',
      source: 'signal',
    });
  });

  it('swallows gRPC errors so the verify flow keeps working (Redis bridge backs us up)', async () => {
    bff.forwardVerificationCode.mockReturnValue(throwError(() => new Error('UNAVAILABLE')) as never);

    await expect(svc.forward('+48111', '123456', 'signal')).resolves.toBeUndefined();

    const err = (svc as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('UNAVAILABLE'));
  });
});

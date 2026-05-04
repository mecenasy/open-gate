import { of, throwError } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import type { ForwardBindingVerifiedRequest, BffContactBindingBridgeClient } from 'src/proto/bff';
import { BffContactBindingPushClient } from './bff-binding-push.client';

function makeReq(over: Partial<ForwardBindingVerifiedRequest> = {}): ForwardBindingVerifiedRequest {
  return {
    bindingId: 'b-1',
    tenantId: 't-1',
    userId: 'u-1',
    platform: 'signal',
    phoneE164: '+48732144653',
    verifiedAt: new Date('2026-05-04T10:00:00Z').toISOString(),
    ...over,
  } as ForwardBindingVerifiedRequest;
}

describe('BffContactBindingPushClient', () => {
  let grpc: jest.Mocked<ClientGrpc>;
  let bridge: jest.Mocked<BffContactBindingBridgeClient>;
  let client: BffContactBindingPushClient;

  beforeEach(() => {
    bridge = {
      forwardBindingVerified: jest.fn(),
    } as unknown as jest.Mocked<BffContactBindingBridgeClient>;

    grpc = {
      getService: jest.fn().mockReturnValue(bridge),
    } as unknown as jest.Mocked<ClientGrpc>;

    client = new BffContactBindingPushClient(grpc);
    client.onModuleInit();
  });

  it('resolves the gRPC service handle on init', () => {
    expect(grpc.getService).toHaveBeenCalledWith('BffContactBindingBridge');
  });

  it('forwards the request to the bridge and resolves on success', async () => {
    bridge.forwardBindingVerified.mockReturnValue(of({ status: true }) as never);

    const req = makeReq();
    await expect(client.forwardBindingVerified(req)).resolves.toBeUndefined();
    expect(bridge.forwardBindingVerified).toHaveBeenCalledWith(req);
  });

  it('swallows errors so verify flow keeps running when BFF is unreachable', async () => {
    bridge.forwardBindingVerified.mockReturnValue(throwError(() => new Error('UNAVAILABLE')) as never);

    const warnSpy = jest
      .spyOn((client as unknown as { logger: { warn: (m: string) => void } }).logger, 'warn')
      .mockImplementation(() => undefined);

    await expect(client.forwardBindingVerified(makeReq({ bindingId: 'b-42' }))).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('b-42'));
    expect(warnSpy.mock.calls[0][0]).toContain('UNAVAILABLE');
  });
});

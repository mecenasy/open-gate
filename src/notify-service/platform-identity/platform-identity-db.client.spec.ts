import { of } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { BindingPlatform } from '@app/entities';
import type {
  PlatformIdentityDbServiceClient,
  PlatformIdentityEntry,
  ResolvePhoneResponse,
} from 'src/proto/platform-identity';
import { PlatformIdentityDbClient } from './platform-identity-db.client';

function makeEntry(over: Partial<PlatformIdentityEntry> = {}): PlatformIdentityEntry {
  return {
    id: 'pi-1',
    tenantId: 't-1',
    userId: 'u-1',
    platform: 'signal',
    platformUserId: 'uuid-1',
    phoneE164: '+48111',
    displayName: 'Marcin',
    verifiedAt: '2026-01-01T00:00:00Z',
    lastSeenAt: '',
    createdAt: '',
    updatedAt: '',
    ...over,
  };
}

describe('PlatformIdentityDbClient', () => {
  let svc: jest.Mocked<PlatformIdentityDbServiceClient>;
  let grpc: jest.Mocked<ClientGrpc>;
  let client: PlatformIdentityDbClient;

  beforeEach(() => {
    svc = {
      resolvePhoneByPlatformUserId: jest.fn(),
      findByPlatformUserId: jest.fn(),
    } as unknown as jest.Mocked<PlatformIdentityDbServiceClient>;
    grpc = { getService: jest.fn().mockReturnValue(svc) } as unknown as jest.Mocked<ClientGrpc>;
    client = new PlatformIdentityDbClient(grpc);
    client.onModuleInit();
  });

  it('resolves the gRPC handle on init', () => {
    expect(grpc.getService).toHaveBeenCalledWith('PlatformIdentityDbService');
  });

  describe('resolvePhoneByPlatformUserId', () => {
    it('returns the raw response (caller decides how to interpret found/empty)', async () => {
      const res: ResolvePhoneResponse = { found: true, phoneE164: '+48111', userId: 'u-1' };
      svc.resolvePhoneByPlatformUserId.mockReturnValue(of(res) as never);

      const got = await client.resolvePhoneByPlatformUserId('t-1', BindingPlatform.Signal, 'uuid-1');
      expect(got).toEqual(res);
      expect(svc.resolvePhoneByPlatformUserId).toHaveBeenCalledWith({
        tenantId: 't-1',
        platform: BindingPlatform.Signal,
        platformUserId: 'uuid-1',
      });
    });

    it('passes through found:false response without remapping', async () => {
      const res: ResolvePhoneResponse = { found: false, phoneE164: '', userId: '' };
      svc.resolvePhoneByPlatformUserId.mockReturnValue(of(res) as never);
      expect(await client.resolvePhoneByPlatformUserId('t-1', BindingPlatform.Signal, 'uuid-x')).toEqual(res);
    });
  });

  describe('findByPlatformUserId', () => {
    it('returns the entry on success', async () => {
      svc.findByPlatformUserId.mockReturnValue(of({ status: true, message: 'OK', data: makeEntry() } as never));

      const got = await client.findByPlatformUserId('t-1', BindingPlatform.Signal, 'uuid-1');
      expect(got).toEqual(makeEntry());
    });

    it('returns null on status=false', async () => {
      svc.findByPlatformUserId.mockReturnValue(of({ status: false, message: '', data: undefined } as never));
      expect(await client.findByPlatformUserId('t-1', BindingPlatform.Signal, 'uuid-x')).toBeNull();
    });

    it('returns null when status=true but data is missing (defensive)', async () => {
      svc.findByPlatformUserId.mockReturnValue(of({ status: true, message: 'OK', data: undefined } as never));
      expect(await client.findByPlatformUserId('t-1', BindingPlatform.Signal, 'uuid-x')).toBeNull();
    });
  });
});

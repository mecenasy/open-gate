import { of } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import type {
  BindingEntry,
  BindingResponse,
  ContactBindingDbServiceClient,
  MarkExpiredResponse,
} from 'src/proto/contact-binding';
import { ContactBindingDbClient } from './contact-binding-db.client';

function makeEntry(over: Partial<BindingEntry> = {}): BindingEntry {
  return {
    id: 'b-1',
    tenantId: 't-1',
    userId: 'u-1',
    phoneE164: '+48732144653',
    token: 'og-abcd23',
    platform: 'signal',
    status: 'pending',
    source: 'operator_frontend',
    outboundMessageId: '1777804992286',
    sendStatus: 'sent',
    sendError: '',
    expiresAt: '',
    verifiedAt: '',
    identityId: '',
    createdAt: '',
    updatedAt: '',
    ...over,
  };
}

function ok(data: BindingEntry): BindingResponse {
  return { status: true, message: 'OK', data };
}

function notFound(): BindingResponse {
  return { status: false, message: 'not found', data: undefined };
}

describe('ContactBindingDbClient', () => {
  let grpc: jest.Mocked<ClientGrpc>;
  let svc: jest.Mocked<ContactBindingDbServiceClient>;
  let client: ContactBindingDbClient;

  beforeEach(() => {
    svc = {
      findBindingByOutboundMessageId: jest.fn(),
      findBindingByToken: jest.fn(),
      verifyBinding: jest.fn(),
      updateBindingSendStatus: jest.fn(),
      markExpiredBindings: jest.fn(),
    } as unknown as jest.Mocked<ContactBindingDbServiceClient>;

    grpc = {
      getService: jest.fn().mockReturnValue(svc),
    } as unknown as jest.Mocked<ClientGrpc>;

    client = new ContactBindingDbClient(grpc);
    client.onModuleInit();
  });

  it('resolves db service handle on init', () => {
    expect(grpc.getService).toHaveBeenCalledWith('ContactBindingDbService');
  });

  describe('findByOutboundMessageId', () => {
    it('returns the entry on success', async () => {
      const entry = makeEntry();
      svc.findBindingByOutboundMessageId.mockReturnValue(of(ok(entry)) as never);

      const got = await client.findByOutboundMessageId('1777804992286');
      expect(got).toEqual(entry);
      expect(svc.findBindingByOutboundMessageId).toHaveBeenCalledWith({ outboundMessageId: '1777804992286' });
    });

    it('returns null when status=false', async () => {
      svc.findBindingByOutboundMessageId.mockReturnValue(of(notFound()) as never);
      expect(await client.findByOutboundMessageId('missing')).toBeNull();
    });

    it('returns null when status=true but data is missing (defensive)', async () => {
      svc.findBindingByOutboundMessageId.mockReturnValue(
        of({ status: true, message: 'OK', data: undefined } satisfies BindingResponse) as never,
      );
      expect(await client.findByOutboundMessageId('id')).toBeNull();
    });
  });

  describe('findByToken', () => {
    it('passes onlyActive flag through', async () => {
      const entry = makeEntry();
      svc.findBindingByToken.mockReturnValue(of(ok(entry)) as never);

      await client.findByToken('og-abcd23', true);
      expect(svc.findBindingByToken).toHaveBeenCalledWith({ token: 'og-abcd23', onlyActive: true });
    });

    it('supports onlyActive=false', async () => {
      svc.findBindingByToken.mockReturnValue(of(notFound()) as never);
      expect(await client.findByToken('og-abcd23', false)).toBeNull();
      expect(svc.findBindingByToken).toHaveBeenCalledWith({ token: 'og-abcd23', onlyActive: false });
    });
  });

  describe('verifyBinding', () => {
    it('forwards id, platformUserId, displayName', async () => {
      const verified = makeEntry({ status: 'verified' });
      svc.verifyBinding.mockReturnValue(of(ok(verified)) as never);

      const got = await client.verifyBinding('b-1', 'uuid-1', 'Marcin');
      expect(got).toEqual(verified);
      expect(svc.verifyBinding).toHaveBeenCalledWith({ id: 'b-1', platformUserId: 'uuid-1', displayName: 'Marcin' });
    });

    it('coerces null displayName to empty string (proto string field)', async () => {
      svc.verifyBinding.mockReturnValue(of(ok(makeEntry({ status: 'verified' }))) as never);
      await client.verifyBinding('b-1', 'uuid-1', null);
      expect(svc.verifyBinding).toHaveBeenCalledWith({ id: 'b-1', platformUserId: 'uuid-1', displayName: '' });
    });

    it('returns null when verify lost the race (already verified/expired)', async () => {
      svc.verifyBinding.mockReturnValue(of(notFound()) as never);
      expect(await client.verifyBinding('b-1', 'uuid-1', null)).toBeNull();
    });
  });

  describe('updateSendStatus', () => {
    it('forwards all fields and returns updated entry', async () => {
      const updated = makeEntry({ sendStatus: 'sent', outboundMessageId: '99' });
      svc.updateBindingSendStatus.mockReturnValue(of(ok(updated)) as never);

      const got = await client.updateSendStatus('b-1', 'sent', '99', null);
      expect(got).toEqual(updated);
      expect(svc.updateBindingSendStatus).toHaveBeenCalledWith({
        id: 'b-1',
        sendStatus: 'sent',
        outboundMessageId: '99',
        sendError: '',
      });
    });

    it('coerces null outboundMessageId and sendError to empty strings', async () => {
      svc.updateBindingSendStatus.mockReturnValue(of(ok(makeEntry())) as never);
      await client.updateSendStatus('b-1', 'failed', null, null);
      expect(svc.updateBindingSendStatus).toHaveBeenCalledWith({
        id: 'b-1',
        sendStatus: 'failed',
        outboundMessageId: '',
        sendError: '',
      });
    });

    it('returns null when db reports failure', async () => {
      svc.updateBindingSendStatus.mockReturnValue(of(notFound()) as never);
      expect(await client.updateSendStatus('b-1', 'failed', null, 'boom')).toBeNull();
    });
  });

  describe('markExpiredBindings', () => {
    it('returns expiredCount from response', async () => {
      svc.markExpiredBindings.mockReturnValue(
        of({ status: true, message: 'OK', expiredCount: 4 } satisfies MarkExpiredResponse) as never,
      );
      expect(await client.markExpiredBindings(0)).toBe(4);
      expect(svc.markExpiredBindings).toHaveBeenCalledWith({ limit: 0 });
    });

    it('returns 0 when nothing was expired', async () => {
      svc.markExpiredBindings.mockReturnValue(
        of({ status: true, message: 'OK', expiredCount: 0 } satisfies MarkExpiredResponse) as never,
      );
      expect(await client.markExpiredBindings(100)).toBe(0);
      expect(svc.markExpiredBindings).toHaveBeenCalledWith({ limit: 100 });
    });
  });
});

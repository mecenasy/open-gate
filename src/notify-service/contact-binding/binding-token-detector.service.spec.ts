import { BindingPlatform } from '@app/entities';
import type { BindingEntry } from 'src/proto/contact-binding';
import type { SignalMessage } from '../incoming/platforms/signal/types';
import { BindingTokenDetectorService } from './binding-token-detector.service';
import type { BffContactBindingPushClient } from './bff-binding-push.client';
import type { ContactBindingDbClient } from './contact-binding-db.client';

function makeBinding(over: Partial<BindingEntry> = {}): BindingEntry {
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

function makeMsg(opts: { quoteId?: number; body?: string; sourceUuid?: string | undefined }): SignalMessage {
  return {
    account: '+48732144653',
    envelope: {
      source: opts.sourceUuid ?? '6f7aee1a-3084-4790-abb4-95689432f0d2',
      sourceNumber: '',
      sourceUuid: opts.sourceUuid ?? '6f7aee1a-3084-4790-abb4-95689432f0d2',
      sourceName: 'Marcin',
      sourceDevice: 1,
      timestamp: 0,
      serverReceivedTimestamp: 0,
      serverDeliveredTimestamp: 0,
      dataMessage: {
        message: opts.body ?? '',
        quote: opts.quoteId !== undefined ? { id: opts.quoteId } : undefined,
      },
    },
  };
}

describe('BindingTokenDetectorService', () => {
  let bindingClient: jest.Mocked<ContactBindingDbClient>;
  let bffPush: jest.Mocked<BffContactBindingPushClient>;
  let detector: BindingTokenDetectorService;

  beforeEach(() => {
    bindingClient = {
      findByOutboundMessageId: jest.fn(),
      findByToken: jest.fn(),
      verifyBinding: jest.fn(),
      updateSendStatus: jest.fn(),
      markExpiredBindings: jest.fn(),
    } as unknown as jest.Mocked<ContactBindingDbClient>;

    bffPush = {
      forwardBindingVerified: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BffContactBindingPushClient>;

    detector = new BindingTokenDetectorService(bindingClient, bffPush);
  });

  it('returns false when no dataMessage', async () => {
    const msg = makeMsg({});
    msg.envelope.dataMessage = undefined;
    expect(await detector.detect(msg, 't-1')).toBe(false);
    expect(bindingClient.findByOutboundMessageId).not.toHaveBeenCalled();
  });

  it('returns false when sourceUuid is missing', async () => {
    const msg = makeMsg({ quoteId: 1234 });
    msg.envelope.sourceUuid = '';
    expect(await detector.detect(msg, 't-1')).toBe(false);
  });

  it('matches by quote.id (primary path) and skips regex when found', async () => {
    bindingClient.findByOutboundMessageId.mockResolvedValue(makeBinding());
    bindingClient.verifyBinding.mockResolvedValue(makeBinding({ status: 'verified' }));

    const msg = makeMsg({ quoteId: 1777804992286, body: 'whatever, even with og-zzzzzz token' });
    expect(await detector.detect(msg, 't-1')).toBe(true);
    expect(bindingClient.findByOutboundMessageId).toHaveBeenCalledWith('1777804992286');
    expect(bindingClient.findByToken).not.toHaveBeenCalled();
    expect(bindingClient.verifyBinding).toHaveBeenCalled();
    expect(bffPush.forwardBindingVerified).toHaveBeenCalledWith(
      expect.objectContaining({ bindingId: 'b-1', platform: BindingPlatform.Signal }),
    );
  });

  it('falls back to regex match when quote misses', async () => {
    bindingClient.findByOutboundMessageId.mockResolvedValue(null);
    bindingClient.findByToken.mockResolvedValue(makeBinding());
    bindingClient.verifyBinding.mockResolvedValue(makeBinding({ status: 'verified' }));

    const msg = makeMsg({ quoteId: 999, body: 'odeślij kod og-abcd23 dziękuję' });
    expect(await detector.detect(msg, 't-1')).toBe(true);
    expect(bindingClient.findByToken).toHaveBeenCalledWith('og-abcd23', true);
  });

  it('returns false when neither quote nor regex match', async () => {
    bindingClient.findByOutboundMessageId.mockResolvedValue(null);
    const msg = makeMsg({ body: 'random conversation text without a token' });
    expect(await detector.detect(msg, 't-1')).toBe(false);
    expect(bindingClient.verifyBinding).not.toHaveBeenCalled();
  });

  it('rejects cross-tenant matches (binding belongs to a different tenant)', async () => {
    bindingClient.findByOutboundMessageId.mockResolvedValue(makeBinding({ tenantId: 't-OTHER' }));
    const msg = makeMsg({ quoteId: 1777804992286 });
    expect(await detector.detect(msg, 't-1')).toBe(false);
    expect(bindingClient.verifyBinding).not.toHaveBeenCalled();
  });

  it('returns false when verifyBinding loses the race (already verified/expired)', async () => {
    bindingClient.findByOutboundMessageId.mockResolvedValue(makeBinding());
    bindingClient.verifyBinding.mockResolvedValue(null);
    const msg = makeMsg({ quoteId: 1777804992286 });
    expect(await detector.detect(msg, 't-1')).toBe(false);
    expect(bffPush.forwardBindingVerified).not.toHaveBeenCalled();
  });
});

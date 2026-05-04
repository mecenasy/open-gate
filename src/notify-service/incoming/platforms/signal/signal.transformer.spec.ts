import { BindingPlatform } from '@app/entities';
import type { PlatformIdentityDbClient } from 'src/notify-service/platform-identity/platform-identity-db.client';
import { SignalTransformer } from './signal.transformer';
import type { SignalMessage } from './types';

function makeMsg(envelope: Partial<SignalMessage['envelope']>): SignalMessage {
  return {
    account: '+48732144653',
    envelope: {
      source: '',
      sourceNumber: '',
      sourceUuid: '',
      sourceName: '',
      sourceDevice: 1,
      timestamp: 0,
      serverReceivedTimestamp: 0,
      serverDeliveredTimestamp: 0,
      dataMessage: { message: 'hi' },
      ...envelope,
    },
  };
}

describe('SignalTransformer chatId resolution', () => {
  let identityClient: jest.Mocked<PlatformIdentityDbClient>;
  let transformer: SignalTransformer;

  beforeEach(() => {
    identityClient = {
      resolvePhoneByPlatformUserId: jest.fn(),
      findByPlatformUserId: jest.fn(),
    } as unknown as jest.Mocked<PlatformIdentityDbClient>;
    transformer = new SignalTransformer(identityClient);
  });

  it('uses sourceNumber when present (sender shares their number)', async () => {
    const msg = makeMsg({
      source: '6f7aee1a-3084-4790-abb4-95689432f0d2',
      sourceNumber: '+48500111222',
      sourceUuid: '6f7aee1a-3084-4790-abb4-95689432f0d2',
    });

    const out = await transformer.transform(msg, { tenantId: 't-1' });
    expect(out.chatId).toBe('+48500111222');
    expect(identityClient.resolvePhoneByPlatformUserId).not.toHaveBeenCalled();
  });

  it('resolves UUID → phone via platform_identities when sourceNumber is hidden', async () => {
    identityClient.resolvePhoneByPlatformUserId.mockResolvedValue({
      found: true,
      phoneE164: '+48500111222',
      userId: 'u-1',
    });
    const msg = makeMsg({
      source: '6f7aee1a-3084-4790-abb4-95689432f0d2',
      sourceNumber: '',
      sourceUuid: '6f7aee1a-3084-4790-abb4-95689432f0d2',
    });

    const out = await transformer.transform(msg, { tenantId: 't-1' });
    expect(out.chatId).toBe('+48500111222');
    expect(identityClient.resolvePhoneByPlatformUserId).toHaveBeenCalledWith(
      't-1',
      BindingPlatform.Signal,
      '6f7aee1a-3084-4790-abb4-95689432f0d2',
    );
  });

  it('falls back to envelope.source (= UUID) when identity lookup misses', async () => {
    identityClient.resolvePhoneByPlatformUserId.mockResolvedValue({
      found: false,
      phoneE164: '',
      userId: '',
    });
    const msg = makeMsg({
      source: '6f7aee1a-3084-4790-abb4-95689432f0d2',
      sourceNumber: '',
      sourceUuid: '6f7aee1a-3084-4790-abb4-95689432f0d2',
    });

    const out = await transformer.transform(msg, { tenantId: 't-1' });
    expect(out.chatId).toBe('6f7aee1a-3084-4790-abb4-95689432f0d2');
  });

  it('falls back to envelope.source when db-service throws (no message loss)', async () => {
    identityClient.resolvePhoneByPlatformUserId.mockRejectedValue(new Error('grpc unavailable'));
    const msg = makeMsg({
      source: '6f7aee1a-3084-4790-abb4-95689432f0d2',
      sourceNumber: '',
      sourceUuid: '6f7aee1a-3084-4790-abb4-95689432f0d2',
    });

    const out = await transformer.transform(msg, { tenantId: 't-1' });
    expect(out.chatId).toBe('6f7aee1a-3084-4790-abb4-95689432f0d2');
  });

  it('skips identity lookup when no tenantId in context', async () => {
    const msg = makeMsg({
      source: '6f7aee1a-3084-4790-abb4-95689432f0d2',
      sourceNumber: '',
      sourceUuid: '6f7aee1a-3084-4790-abb4-95689432f0d2',
    });

    const out = await transformer.transform(msg, undefined);
    expect(out.chatId).toBe('6f7aee1a-3084-4790-abb4-95689432f0d2');
    expect(identityClient.resolvePhoneByPlatformUserId).not.toHaveBeenCalled();
  });
});

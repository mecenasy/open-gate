import { MockProcurementProvider } from './mock-procurement.provider';

describe('MockProcurementProvider', () => {
  let provider: MockProcurementProvider;

  beforeEach(() => {
    provider = new MockProcurementProvider();
    jest
      .spyOn((provider as unknown as { logger: { log: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
  });

  it('exposes providerKey="mock"', () => {
    expect(provider.providerKey).toBe('mock');
  });

  it('does not implement countMessagesForRange (cron should skip mock rows)', () => {
    expect(provider.countMessagesForRange).toBeUndefined();
  });

  describe('listAvailable', () => {
    it('returns the shared real test number first', async () => {
      const list = await provider.listAvailable({ country: 'PL' });
      expect(list[0].phoneE164).toBe('+48732144653');
      expect(list[0].capabilities).toEqual({ sms: true, mms: true, voice: true });
    });

    it('returns up to `limit` numbers (counting the shared one)', async () => {
      const list = await provider.listAvailable({ country: 'PL', limit: 3 });
      expect(list).toHaveLength(3);
    });

    it('defaults to limit=10 (shared + 9 fakes)', async () => {
      const list = await provider.listAvailable({ country: 'PL' });
      expect(list).toHaveLength(10);
    });

    it('returns only the shared number when limit=1', async () => {
      const list = await provider.listAvailable({ country: 'PL', limit: 1 });
      expect(list).toHaveLength(1);
      expect(list[0].phoneE164).toBe('+48732144653');
    });

    it('uses +4873 prefix for PL fakes and +1555 for others', async () => {
      const pl = await provider.listAvailable({ country: 'pl', limit: 5 });
      // index 1+ are fakes (index 0 is the shared real)
      expect(pl[1].phoneE164.startsWith('+4873')).toBe(true);

      const us = await provider.listAvailable({ country: 'US', limit: 5 });
      expect(us[1].phoneE164.startsWith('+1555')).toBe(true);
    });
  });

  describe('purchase', () => {
    it('returns a fresh mock-* externalId per call', async () => {
      const a = await provider.purchase({ phoneE164: '+1', country: 'PL' });
      const b = await provider.purchase({ phoneE164: '+1', country: 'PL' });
      expect(a.externalId).toMatch(/^mock-/);
      expect(b.externalId).toMatch(/^mock-/);
      expect(a.externalId).not.toEqual(b.externalId);
    });

    it('echoes the requested phone number with full capabilities', async () => {
      const out = await provider.purchase({ phoneE164: '+48222', country: 'PL' });
      expect(out.phoneE164).toBe('+48222');
      expect(out.capabilities).toEqual({ sms: true, mms: true, voice: true });
    });
  });

  describe('release', () => {
    it('returns released:true for any externalId', async () => {
      const out = await provider.release('mock-abc');
      expect(out).toEqual({ externalId: 'mock-abc', released: true });
    });
  });
});

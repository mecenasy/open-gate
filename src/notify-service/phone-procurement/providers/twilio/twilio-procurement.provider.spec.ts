const localList = jest.fn();
const mobileList = jest.fn();
const tollFreeList = jest.fn();
const incomingCreate = jest.fn();
const remove = jest.fn();
const messagesList = jest.fn();
const numberRefFn = jest.fn().mockReturnValue({ remove });

const TwilioCtor = jest.fn().mockImplementation(() => ({
  availablePhoneNumbers: jest.fn().mockReturnValue({
    local: { list: localList },
    mobile: { list: mobileList },
    tollFree: { list: tollFreeList },
  }),
  incomingPhoneNumbers: Object.assign(numberRefFn, { create: incomingCreate }),
  messages: { list: messagesList },
}));

jest.mock('twilio', () => ({ __esModule: true, Twilio: TwilioCtor }));

import {
  DEFAULT_PLATFORM_FALLBACK_ID,
  type PlatformConfigService,
  type SmsCredentials,
} from '../../../platform-config/platform-config.service';
import { TwilioProcurementProvider } from './twilio-procurement.provider';

const MASTER: SmsCredentials = {
  provider: 'twilio',
  sid: 'AC123',
  token: 'token-x',
  phone: '',
  bundleSidByCountry: { PL: 'BUbundle' },
  addressSidByCountry: { PL: 'ADaddr' },
};

describe('TwilioProcurementProvider', () => {
  let cfg: jest.Mocked<PlatformConfigService>;
  let provider: TwilioProcurementProvider;

  beforeEach(() => {
    TwilioCtor.mockClear();
    localList.mockReset();
    mobileList.mockReset();
    tollFreeList.mockReset();
    incomingCreate.mockReset();
    remove.mockReset().mockResolvedValue(undefined);
    messagesList.mockReset();

    cfg = { getConfig: jest.fn() } as unknown as jest.Mocked<PlatformConfigService>;
    provider = new TwilioProcurementProvider(cfg);
    jest
      .spyOn((provider as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  it('exposes providerKey="twilio"', () => {
    expect(provider.providerKey).toBe('twilio');
  });

  describe('master credentials guard', () => {
    it('throws when master row has no sid/token', async () => {
      cfg.getConfig.mockResolvedValue({ provider: 'twilio', sid: '', token: '', phone: '' } as SmsCredentials);

      await expect(provider.listAvailable({ country: 'PL' })).rejects.toThrow(/master SMS credentials/);
      expect(cfg.getConfig).toHaveBeenCalledWith(DEFAULT_PLATFORM_FALLBACK_ID, 'sms');
    });

    it('caches the Twilio client by sid and reuses it', async () => {
      cfg.getConfig.mockResolvedValue(MASTER);
      mobileList.mockResolvedValue([]);

      await provider.listAvailable({ country: 'PL' });
      await provider.listAvailable({ country: 'PL' });
      expect(TwilioCtor).toHaveBeenCalledTimes(1);
    });

    it('rebuilds client when master sid rotates', async () => {
      cfg.getConfig.mockResolvedValueOnce(MASTER).mockResolvedValueOnce({ ...MASTER, sid: 'AC999' });
      mobileList.mockResolvedValue([]);

      await provider.listAvailable({ country: 'PL' });
      await provider.listAvailable({ country: 'PL' });
      expect(TwilioCtor).toHaveBeenCalledTimes(2);
    });
  });

  describe('listAvailable', () => {
    beforeEach(() => {
      cfg.getConfig.mockResolvedValue(MASTER);
    });

    it('uses mobile list by default and normalizes capabilities', async () => {
      mobileList.mockResolvedValue([
        { phoneNumber: '+48111', capabilities: { SMS: true, MMS: false, voice: true }, region: 'MZ', locality: 'WAW' },
      ]);

      const out = await provider.listAvailable({ country: 'PL' });
      expect(mobileList).toHaveBeenCalledWith({ limit: 10 });
      expect(out).toEqual([
        {
          phoneE164: '+48111',
          capabilities: { sms: true, mms: false, voice: true },
          region: 'MZ',
          locality: 'WAW',
        },
      ]);
    });

    it('uses local list for type=local and respects limit', async () => {
      localList.mockResolvedValue([]);
      await provider.listAvailable({ country: 'PL', type: 'local', limit: 3 });
      expect(localList).toHaveBeenCalledWith({ limit: 3 });
    });

    it('uses tollFree list for type=tollfree', async () => {
      tollFreeList.mockResolvedValue([]);
      await provider.listAvailable({ country: 'PL', type: 'tollfree' });
      expect(tollFreeList).toHaveBeenCalledWith({ limit: 10 });
    });

    it('drops empty region/locality strings', async () => {
      mobileList.mockResolvedValue([{ phoneNumber: '+48111', capabilities: {}, region: '', locality: '' }]);
      const out = await provider.listAvailable({ country: 'PL' });
      expect(out[0].region).toBeUndefined();
      expect(out[0].locality).toBeUndefined();
    });
  });

  describe('purchase', () => {
    beforeEach(() => {
      cfg.getConfig.mockResolvedValue(MASTER);
    });

    it('passes bundle, address, sms and voice URLs when available', async () => {
      incomingCreate.mockResolvedValue({
        sid: 'PN1',
        phoneNumber: '+48111',
        capabilities: { SMS: true, MMS: false, voice: false },
      });

      const out = await provider.purchase({
        country: 'PL',
        phoneE164: '+48111',
        webhookSmsUrl: 'https://hooks/sms',
        webhookVoiceUrl: 'https://hooks/voice',
      });

      expect(incomingCreate).toHaveBeenCalledWith({
        phoneNumber: '+48111',
        bundleSid: 'BUbundle',
        addressSid: 'ADaddr',
        smsUrl: 'https://hooks/sms',
        voiceUrl: 'https://hooks/voice',
      });
      expect(out).toEqual({
        externalId: 'PN1',
        phoneE164: '+48111',
        capabilities: { sms: true, mms: false, voice: false },
      });
    });

    it('omits webhook URLs when undefined and warns when no bundle / address for country', async () => {
      cfg.getConfig.mockResolvedValue({ ...MASTER, bundleSidByCountry: undefined, addressSidByCountry: undefined });
      incomingCreate.mockResolvedValue({
        sid: 'PN1',
        phoneNumber: '+1',
        capabilities: { SMS: true },
      });

      await provider.purchase({ country: 'US', phoneE164: '+1' });

      expect(incomingCreate).toHaveBeenCalledWith({ phoneNumber: '+1' });
    });
  });

  describe('release', () => {
    it('removes the incoming phone number by SID', async () => {
      cfg.getConfig.mockResolvedValue(MASTER);

      const out = await provider.release('PN1');

      expect(numberRefFn).toHaveBeenCalledWith('PN1');
      expect(remove).toHaveBeenCalled();
      expect(out).toEqual({ externalId: 'PN1', released: true });
    });
  });

  describe('countMessagesForRange', () => {
    it('returns Twilio messages.list length', async () => {
      cfg.getConfig.mockResolvedValue(MASTER);
      messagesList.mockResolvedValue([{}, {}, {}, {}]);

      const out = await provider.countMessagesForRange({
        phoneE164: '+1',
        fromUtc: new Date('2026-05-03T00:00:00Z'),
        toUtc: new Date('2026-05-04T00:00:00Z'),
      });

      expect(out).toBe(4);
      expect(messagesList).toHaveBeenCalledWith({
        from: '+1',
        dateSentAfter: new Date('2026-05-03T00:00:00Z'),
        dateSentBefore: new Date('2026-05-04T00:00:00Z'),
        limit: 5000,
      });
    });
  });
});

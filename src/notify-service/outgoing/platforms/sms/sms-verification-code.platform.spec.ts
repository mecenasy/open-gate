const messagesCreate = jest.fn();
const TwilioCtor = jest.fn().mockImplementation(() => ({
  messages: { create: messagesCreate },
}));

jest.mock('twilio', () => ({
  __esModule: true,
  Twilio: TwilioCtor,
}));

import type { TenantService } from '@app/tenant';
import { Platform } from '../../../types/platform';
import {
  DEFAULT_PLATFORM_FALLBACK_ID,
  type PlatformConfigService,
  type ResolvedSmsCredentials,
} from '../../../platform-config/platform-config.service';
import { SmsVerificationCodePlatform } from './sms-verification-code.platform';

const CREDS: ResolvedSmsCredentials = {
  provider: 'twilio',
  sid: 'AC123',
  token: 'token-x',
  phone: '+48999',
};

describe('SmsVerificationCodePlatform.send', () => {
  let tenantService: jest.Mocked<TenantService>;
  let cfg: jest.Mocked<PlatformConfigService>;
  let svc: SmsVerificationCodePlatform;

  beforeEach(() => {
    TwilioCtor.mockClear();
    messagesCreate.mockReset().mockResolvedValue({ sid: 'SM-1' });

    tenantService = { getContext: jest.fn() } as unknown as jest.Mocked<TenantService>;
    cfg = { resolveSmsCredentials: jest.fn() } as unknown as jest.Mocked<PlatformConfigService>;
    svc = new SmsVerificationCodePlatform(tenantService, cfg);
    jest
      .spyOn((svc as unknown as { logger: { warn: jest.Mock; error: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((svc as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  it('exposes Platform.Sms', () => {
    expect(svc.platform).toBe(Platform.Sms);
  });

  it('skips send and logs warn when phoneNumber is missing', async () => {
    await svc.send({ phoneNumber: undefined }, 1234);

    expect(cfg.resolveSmsCredentials).not.toHaveBeenCalled();
    expect(TwilioCtor).not.toHaveBeenCalled();
    const warn = (svc as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('phoneNumber is missing'));
  });

  it('uses tenant context when set', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-7' } as never);
    cfg.resolveSmsCredentials.mockResolvedValue(CREDS);

    await svc.send({ phoneNumber: '+48222' }, 1234);

    expect(cfg.resolveSmsCredentials).toHaveBeenCalledWith('t-7');
    expect(TwilioCtor).toHaveBeenCalledWith('AC123', 'token-x');
    expect(messagesCreate).toHaveBeenCalledWith({
      body: 'Your code is: 1234',
      from: '+48999',
      to: '+48222',
    });
  });

  it('falls back to DEFAULT_PLATFORM_FALLBACK_ID when no tenant context', async () => {
    tenantService.getContext.mockReturnValue(undefined);
    cfg.resolveSmsCredentials.mockResolvedValue(CREDS);

    await svc.send({ phoneNumber: '+48222' }, 1234);

    expect(cfg.resolveSmsCredentials).toHaveBeenCalledWith(DEFAULT_PLATFORM_FALLBACK_ID);
  });

  it('skips send when credentials cannot be resolved', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-7' } as never);
    cfg.resolveSmsCredentials.mockResolvedValue(null);

    await svc.send({ phoneNumber: '+48222' }, 1234);

    expect(TwilioCtor).not.toHaveBeenCalled();
    const warn = (svc as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('No usable SMS credentials'));
  });

  it('logs (does not throw) when twilio create rejects', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-7' } as never);
    cfg.resolveSmsCredentials.mockResolvedValue(CREDS);
    messagesCreate.mockRejectedValue(new Error('upstream error'));

    await expect(svc.send({ phoneNumber: '+48222' }, 1234)).resolves.toBeUndefined();
    const err = (svc as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith('Failed to send SMS.', expect.any(Error));
  });
});

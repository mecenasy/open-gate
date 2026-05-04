const sendMail = jest.fn();
const createTransport = jest.fn().mockImplementation(() => ({ sendMail }));

jest.mock('nodemailer', () => ({
  __esModule: true,
  createTransport,
}));

import type { TenantService } from '@app/tenant';
import {
  DEFAULT_PLATFORM_FALLBACK_ID,
  type PlatformConfigService,
  type SmtpCredentials,
} from '../../../platform-config/platform-config.service';
import { DynamicSmtpService } from './dynamic-smtp.service';

const SMTP: SmtpCredentials = {
  host: 'smtp.example.com',
  port: 465,
  user: 'user',
  password: 'pass',
  from: 'noreply@example.com',
};

describe('DynamicSmtpService.sendMail', () => {
  let tenantService: jest.Mocked<TenantService>;
  let cfg: jest.Mocked<PlatformConfigService>;
  let svc: DynamicSmtpService;

  beforeEach(() => {
    createTransport.mockClear();
    sendMail.mockReset().mockResolvedValue(undefined);

    tenantService = { getContext: jest.fn() } as unknown as jest.Mocked<TenantService>;
    cfg = { getConfig: jest.fn() } as unknown as jest.Mocked<PlatformConfigService>;
    svc = new DynamicSmtpService(tenantService, cfg);

    jest.spyOn((svc as unknown as { logger: { warn: jest.Mock } }).logger, 'warn').mockImplementation(() => undefined);
  });

  it('skips with warn when no SMTP config', async () => {
    cfg.getConfig.mockResolvedValue(null);

    await svc.sendMail({ to: 'x@y.z', subject: 's', text: 't' });

    expect(createTransport).not.toHaveBeenCalled();
    const warn = (svc as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('No SMTP config'));
  });

  it('builds a transporter with tenant config and sends with default From wrapper', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SMTP);

    await svc.sendMail({ to: 'x@y.z', subject: 's', text: 't' });

    expect(cfg.getConfig).toHaveBeenCalledWith('t-1', 'smtp');
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 465,
        secure: false,
        requireTLS: true,
        auth: { user: 'user', pass: 'pass' },
        tls: { rejectUnauthorized: false },
      }),
    );
    expect(sendMail).toHaveBeenCalledWith({
      from: '"No Reply" <noreply@example.com>',
      to: 'x@y.z',
      subject: 's',
      text: 't',
    });
  });

  it('falls back to DEFAULT_PLATFORM_FALLBACK_ID when no tenant context', async () => {
    tenantService.getContext.mockReturnValue(undefined);
    cfg.getConfig.mockResolvedValue(SMTP);

    await svc.sendMail({ to: 'x@y.z' });
    expect(cfg.getConfig).toHaveBeenCalledWith(DEFAULT_PLATFORM_FALLBACK_ID, 'smtp');
  });

  it('options "from" overrides default when provided', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SMTP);

    await svc.sendMail({ to: 'x@y.z', from: 'override@y.z' });

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'override@y.z' }));
  });
});

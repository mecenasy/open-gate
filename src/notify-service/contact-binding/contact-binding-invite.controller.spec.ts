import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders } from 'axios';
import type { HttpService } from '@nestjs/axios';
import { BindingPlatform, ContactBindingSendStatus } from '@app/entities';
import type { SendBindingInviteRequest } from 'src/proto/contact-binding';
import type { PlatformConfigService, SignalCredentials } from '../platform-config/platform-config.service';
import { ContactBindingInviteController } from './contact-binding-invite.controller';

function makeReq(over: Partial<SendBindingInviteRequest> = {}): SendBindingInviteRequest {
  return {
    bindingId: 'b-1',
    tenantId: 't-1',
    phoneE164: '+48732144653',
    platform: BindingPlatform.Signal,
    token: 'og-abcd23',
    tenantName: 'Acme',
    ...over,
  };
}

const SIGNAL_CFG: SignalCredentials = {
  apiUrl: 'http://signal-cli:8080',
  account: '+48111222333',
};

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('request failed');
  err.response = {
    status,
    statusText: 'Bad Request',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosError['response'];
  err.config = { headers: new AxiosHeaders() } as AxiosError['config'];
  return err;
}

describe('ContactBindingInviteController.sendBindingInvite', () => {
  let httpService: jest.Mocked<HttpService>;
  let platformConfig: jest.Mocked<PlatformConfigService>;
  let controller: ContactBindingInviteController;

  beforeEach(() => {
    httpService = { post: jest.fn() } as unknown as jest.Mocked<HttpService>;
    platformConfig = { getConfig: jest.fn() } as unknown as jest.Mocked<PlatformConfigService>;
    controller = new ContactBindingInviteController(httpService, platformConfig);
    jest
      .spyOn((controller as unknown as { logger: { warn: jest.Mock; log: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((controller as unknown as { logger: { log: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
  });

  it('rejects unsupported platforms (MVP is Signal-only)', async () => {
    const res = await controller.sendBindingInvite(makeReq({ platform: BindingPlatform.WhatsApp }));
    expect(res).toEqual({
      status: false,
      message: expect.stringContaining('whatsapp'),
      outboundMessageId: '',
      sendStatus: ContactBindingSendStatus.Failed,
    });
    expect(platformConfig.getConfig).not.toHaveBeenCalled();
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it('fails when tenant has no Signal config', async () => {
    platformConfig.getConfig.mockResolvedValue(null);

    const res = await controller.sendBindingInvite(makeReq());
    expect(res).toEqual({
      status: false,
      message: 'No Signal config for tenant',
      outboundMessageId: '',
      sendStatus: ContactBindingSendStatus.Failed,
    });
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it('sends via /v2/send and returns timestamp as outboundMessageId on success', async () => {
    platformConfig.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(of({ data: { timestamp: 1777804992286 } }) as never);

    const res = await controller.sendBindingInvite(makeReq());

    expect(httpService.post).toHaveBeenCalledWith(
      'http://signal-cli:8080/v2/send',
      expect.objectContaining({
        number: '+48111222333',
        recipients: ['+48732144653'],
        message: expect.stringContaining('og-abcd23'),
      }),
    );
    expect(res).toEqual({
      status: true,
      message: 'OK',
      outboundMessageId: '1777804992286',
      sendStatus: ContactBindingSendStatus.Sent,
    });
  });

  it('uses tenantName in the message body', async () => {
    platformConfig.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(of({ data: { timestamp: 1 } }) as never);

    await controller.sendBindingInvite(makeReq({ tenantName: 'Coolio' }));

    const body = (httpService.post.mock.calls[0]![1] as { message: string }).message;
    expect(body).toContain('Coolio');
    expect(body).toContain('og-abcd23');
  });

  it('treats missing timestamp in response as failure', async () => {
    platformConfig.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(of({ data: {} }) as never);

    const res = await controller.sendBindingInvite(makeReq());
    expect(res).toEqual({
      status: false,
      message: 'signal-cli response missing timestamp',
      outboundMessageId: '',
      sendStatus: ContactBindingSendStatus.Failed,
    });
  });

  it('returns NotOnPlatform when signal-cli reports unregistered recipient', async () => {
    platformConfig.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(
      throwError(() => makeAxiosError(400, { error: 'User +48999111000 is not registered.' })) as never,
    );

    const res = await controller.sendBindingInvite(makeReq({ phoneE164: '+48999111000' }));
    expect(res.status).toBe(false);
    expect(res.sendStatus).toBe(ContactBindingSendStatus.NotOnPlatform);
    expect(res.message).toContain('not registered');
  });

  it('returns Failed for generic axios errors (4xx that are not "not registered")', async () => {
    platformConfig.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(throwError(() => makeAxiosError(400, { error: 'Bad request' })) as never);

    const res = await controller.sendBindingInvite(makeReq());
    expect(res.status).toBe(false);
    expect(res.sendStatus).toBe(ContactBindingSendStatus.Failed);
  });

  it('returns Failed for non-axios errors', async () => {
    platformConfig.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(throwError(() => new Error('connect ECONNREFUSED')) as never);

    const res = await controller.sendBindingInvite(makeReq());
    expect(res.status).toBe(false);
    expect(res.sendStatus).toBe(ContactBindingSendStatus.Failed);
    expect(res.message).toContain('ECONNREFUSED');
  });

  it('truncates very long error payloads to 500 chars', async () => {
    platformConfig.getConfig.mockResolvedValue(SIGNAL_CFG);
    const huge = 'x'.repeat(2000);
    httpService.post.mockReturnValue(throwError(() => makeAxiosError(500, { error: huge })) as never);

    const res = await controller.sendBindingInvite(makeReq());
    expect(res.message.length).toBeLessThanOrEqual(500);
  });
});

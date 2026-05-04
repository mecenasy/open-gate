import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders } from 'axios';
import type { HttpService } from '@nestjs/axios';
import type { TenantService } from '@app/tenant';
import { Platform } from '../../../types/platform';
import { Type, type UnifiedMessage } from '../../../types/unified-message';
import type { PlatformConfigService, SignalCredentials } from '../../../platform-config/platform-config.service';
import { SignalSender } from './signal-sender';

const SIGNAL_CFG: SignalCredentials = { apiUrl: 'http://signal:8080', account: '+48111' };

function makeMsg(over: Partial<UnifiedMessage> = {}): UnifiedMessage {
  return {
    platform: Platform.Signal,
    chatId: '+48222',
    authorId: '+48222',
    messageId: 'm-1',
    type: Type.Text,
    content: 'hi',
    raw: {},
    ...over,
  };
}

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('failed');
  err.response = {
    status,
    statusText: 'X',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosError['response'];
  err.config = { headers: new AxiosHeaders() } as AxiosError['config'];
  return err;
}

describe('SignalSender.send', () => {
  let httpService: jest.Mocked<HttpService>;
  let tenantService: jest.Mocked<TenantService>;
  let cfg: jest.Mocked<PlatformConfigService>;
  let sender: SignalSender;

  beforeEach(() => {
    httpService = { post: jest.fn() } as unknown as jest.Mocked<HttpService>;
    tenantService = { getContext: jest.fn() } as unknown as jest.Mocked<TenantService>;
    cfg = { getConfig: jest.fn(), envFallback: jest.fn() } as unknown as jest.Mocked<PlatformConfigService>;
    sender = new SignalSender(httpService, tenantService, cfg);

    jest
      .spyOn((sender as unknown as { logger: { warn: jest.Mock; log: jest.Mock; error: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest.spyOn((sender as unknown as { logger: { log: jest.Mock } }).logger, 'log').mockImplementation(() => undefined);
    jest
      .spyOn((sender as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  it('exposes Platform.Signal', () => {
    expect(sender.platform).toBe(Platform.Signal);
  });

  it('does nothing (logs error) when chatId is missing', async () => {
    await sender.send(makeMsg({ chatId: '' }));
    expect(httpService.post).not.toHaveBeenCalled();
    expect(cfg.getConfig).not.toHaveBeenCalled();
    const err = (sender as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Missing chatId'));
  });

  it('uses tenant config when tenant context is set', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(of({ data: {} }) as never);

    await sender.send(makeMsg({ content: 'hello' }));

    expect(cfg.getConfig).toHaveBeenCalledWith('t-1', 'signal');
    expect(httpService.post).toHaveBeenCalledWith('http://signal:8080/v1/send', {
      message: 'hello',
      number: '+48111',
      recipients: ['+48222'],
    });
  });

  it('falls back to envFallback when no tenant context', async () => {
    tenantService.getContext.mockReturnValue(undefined);
    cfg.envFallback.mockReturnValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(of({ data: {} }) as never);

    await sender.send(makeMsg());

    expect(cfg.envFallback).toHaveBeenCalledWith('signal');
    expect(httpService.post).toHaveBeenCalled();
  });

  it('skips send when no credentials are resolvable', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(null);

    await sender.send(makeMsg());

    expect(httpService.post).not.toHaveBeenCalled();
    const warn = (sender as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('No Signal config'));
  });

  it('logs (does not throw) when text send is missing content', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);

    await sender.send(makeMsg({ content: undefined }));

    expect(httpService.post).not.toHaveBeenCalled();
    const err = (sender as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Missing content'));
  });

  it('sends audio with base64 attachment via /v2/send', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(of({ data: { timestamp: 1 } }) as never);

    const data = Buffer.from('audio-bytes');
    await sender.send(
      makeMsg({
        type: Type.Audio,
        content: undefined,
        media: { url: 'a', contentType: 'audio/aac', data },
      }),
    );

    expect(httpService.post).toHaveBeenCalledWith(
      'http://signal:8080/v2/send',
      expect.objectContaining({
        is_voice_note: true,
        base64_attachments: [`data:audio/aac;base64,${data.toString('base64')}`],
        recipients: ['+48222'],
        number: '+48111',
      }),
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
  });

  it('logs error when audio payload data is missing', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);

    await sender.send(makeMsg({ type: Type.Audio, media: undefined }));

    expect(httpService.post).not.toHaveBeenCalled();
    const err = (sender as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Missing audio data'));
  });

  it('logs detailed message for axios errors', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(throwError(() => makeAxiosError(500, { error: 'boom' })) as never);

    await sender.send(makeMsg());

    const err = (sender as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });

  it('logs message for non-axios errors', async () => {
    tenantService.getContext.mockReturnValue({ tenantId: 't-1' } as never);
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.post.mockReturnValue(throwError(() => new Error('ECONNREFUSED')) as never);

    await sender.send(makeMsg());

    const err = (sender as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('ECONNREFUSED'));
  });
});

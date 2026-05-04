import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders } from 'axios';
import type { HttpService } from '@nestjs/axios';
import type { ClientGrpc } from '@nestjs/microservices';
import { Platform } from '../../../types/platform';
import { Type, type UnifiedMessage } from '../../../types/unified-message';
import type { PlatformConfigService, SignalCredentials } from '../../../platform-config/platform-config.service';
import { SignalAttachment } from './signal.attachment';
import type { SignalMessage } from './types';

function makeMessage(url: string | null = 'att-1'): UnifiedMessage<SignalMessage> {
  return {
    platform: Platform.Signal,
    chatId: '+1',
    authorId: '+1',
    messageId: 'm-1',
    type: Type.Image,
    media: url ? { url, contentType: 'image/jpeg' } : undefined,
    raw: {} as SignalMessage,
  };
}

const SIGNAL_CFG: SignalCredentials = { apiUrl: 'http://signal-bridge:9090', account: '+48111' };

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('failed');
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

describe('SignalAttachment.download', () => {
  let httpService: jest.Mocked<HttpService>;
  let cfg: jest.Mocked<PlatformConfigService>;
  let grpc: jest.Mocked<ClientGrpc>;
  let signal: SignalAttachment;

  beforeEach(() => {
    httpService = { get: jest.fn() } as unknown as jest.Mocked<HttpService>;
    cfg = {
      getConfig: jest.fn(),
      envFallback: jest.fn(),
    } as unknown as jest.Mocked<PlatformConfigService>;
    grpc = { getService: jest.fn().mockReturnValue({}) } as unknown as jest.Mocked<ClientGrpc>;

    signal = new SignalAttachment(httpService, grpc, cfg);
    signal.onModuleInit();
    jest
      .spyOn((signal as unknown as { logger: { error: jest.Mock; log: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
    jest.spyOn((signal as unknown as { logger: { log: jest.Mock } }).logger, 'log').mockImplementation(() => undefined);
  });

  it('exposes Platform.Signal', () => {
    expect(signal.platform).toBe(Platform.Signal);
  });

  it('throws when message has no media url', async () => {
    await expect(signal.download(makeMessage(null))).rejects.toThrow(/Failed to download attachment.*No media url/);
  });

  it('uses tenant config when tenantId is provided', async () => {
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.get.mockReturnValue(of({ data: Buffer.from('bin') }) as never);

    const data = await signal.download(makeMessage('att-1'), 't-1');

    expect(cfg.getConfig).toHaveBeenCalledWith('t-1', 'signal');
    expect(httpService.get).toHaveBeenCalledWith(
      'http://signal-bridge:9090/v1/attachments/att-1',
      expect.objectContaining({ responseType: 'arraybuffer' }),
    );
    expect(data).toEqual(Buffer.from('bin'));
  });

  it('falls back to env when tenantId is omitted', async () => {
    cfg.envFallback.mockReturnValue(SIGNAL_CFG);
    httpService.get.mockReturnValue(of({ data: Buffer.from('bin2') }) as never);

    await signal.download(makeMessage('att-2'));

    expect(cfg.envFallback).toHaveBeenCalledWith('signal');
    expect(httpService.get).toHaveBeenCalledWith('http://signal-bridge:9090/v1/attachments/att-2', expect.any(Object));
  });

  it('falls back to default base URL when no config available at all', async () => {
    cfg.getConfig.mockResolvedValue(null);
    httpService.get.mockReturnValue(of({ data: Buffer.from('bin3') }) as never);

    await signal.download(makeMessage('att-3'), 't-1');
    expect(httpService.get).toHaveBeenCalledWith('http://signal_bridge:8080/v1/attachments/att-3', expect.any(Object));
  });

  it('throws when downloaded payload is empty', async () => {
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.get.mockReturnValue(of({ data: undefined }) as never);

    await expect(signal.download(makeMessage('att-4'), 't-1')).rejects.toThrow(/Failed to download/);
  });

  it('rethrows axios errors with response detail in the message', async () => {
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.get.mockReturnValue(throwError(() => makeAxiosError(404, { error: 'not found' })) as never);

    await expect(signal.download(makeMessage('att-5'), 't-1')).rejects.toThrow(/not found/);
  });

  it('rethrows non-axios errors', async () => {
    cfg.getConfig.mockResolvedValue(SIGNAL_CFG);
    httpService.get.mockReturnValue(throwError(() => new Error('ECONNREFUSED')) as never);

    await expect(signal.download(makeMessage('att-6'), 't-1')).rejects.toThrow(/ECONNREFUSED/);
  });
});

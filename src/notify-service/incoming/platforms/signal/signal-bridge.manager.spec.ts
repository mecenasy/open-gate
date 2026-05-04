type WsHandler = (...args: unknown[]) => void;

class FakeWebSocket {
  url: string;
  handlers: Record<string, WsHandler[]> = {};
  terminated = false;
  static instances: FakeWebSocket[] = [];

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  on(event: string, fn: WsHandler): this {
    (this.handlers[event] ??= []).push(fn);
    return this;
  }

  pong(): void {
    /* no-op */
  }

  terminate(): void {
    this.terminated = true;
  }

  emit(event: string, ...args: unknown[]): void {
    (this.handlers[event] ?? []).forEach((fn) => fn(...args));
  }
}

jest.mock('ws', () => ({
  __esModule: true,
  WebSocket: jest.fn().mockImplementation((url: string) => new FakeWebSocket(url)),
}));

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

import { EventBus } from '@nestjs/cqrs';
import { Platform } from '../../../types/platform';
import { MessageEvent } from '../../event/message.event';
import type { BindingTokenDetectorService } from '../../../contact-binding/binding-token-detector.service';
import type { PlatformConfigService, SignalCredentials } from '../../../platform-config/platform-config.service';
import { SignalBridgeManager } from './signal-bridge.manager';

function makeCfg(over: Partial<SignalCredentials> = {}): SignalCredentials {
  return { apiUrl: 'http://signal:8080', account: '+48111', ...over };
}

describe('SignalBridgeManager', () => {
  let eventBus: jest.Mocked<EventBus>;
  let platformConfig: jest.Mocked<PlatformConfigService>;
  let detector: jest.Mocked<BindingTokenDetectorService>;
  let manager: SignalBridgeManager;

  beforeEach(() => {
    jest.useFakeTimers();
    FakeWebSocket.instances = [];

    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    platformConfig = {
      invalidate: jest.fn(),
      getConfig: jest.fn(),
      getTenantsWithPlatform: jest.fn(),
      envFallback: jest.fn().mockReturnValue(null),
    } as unknown as jest.Mocked<PlatformConfigService>;
    detector = { detect: jest.fn().mockResolvedValue(false) } as unknown as jest.Mocked<BindingTokenDetectorService>;

    manager = new SignalBridgeManager(eventBus, platformConfig, detector);
    jest
      .spyOn(
        (manager as unknown as { logger: { warn: jest.Mock; log: jest.Mock; error: jest.Mock; debug: jest.Mock } })
          .logger,
        'warn',
      )
      .mockImplementation(() => undefined);
    jest
      .spyOn((manager as unknown as { logger: { log: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
    jest
      .spyOn((manager as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
    jest
      .spyOn((manager as unknown as { logger: { debug: jest.Mock } }).logger, 'debug')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    manager.onModuleDestroy();
    jest.useRealTimers();
  });

  it('opens a WS for each tenant returned by reconcile', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([
      { tenantId: 't-1', config: makeCfg({ account: '+48111' }) },
      { tenantId: 't-2', config: makeCfg({ account: '+48222' }) },
    ]);

    await manager.onModuleInit();

    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.instances[0].url).toContain('ws://signal:8080/v1/receive/');
    expect(FakeWebSocket.instances[0].url).toContain(encodeURIComponent('+48111'));
  });

  it('skips tenants whose account is empty after trim', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg({ account: '   ' }) }]);

    await manager.onModuleInit();

    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it('uses envFallback apiUrl when tenant config has no apiUrl', async () => {
    platformConfig.envFallback.mockReturnValue({ apiUrl: 'http://fallback:9000', account: 'x' });
    platformConfig.getTenantsWithPlatform.mockResolvedValue([
      { tenantId: 't-1', config: { apiUrl: '', account: '+1' } },
    ]);

    await manager.onModuleInit();

    expect(FakeWebSocket.instances[0].url).toContain('ws://fallback:9000/');
  });

  it('logs at debug and exits when no tenants and no connections', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([]);
    await manager.onModuleInit();

    const debug = (manager as unknown as { logger: { debug: jest.Mock } }).logger.debug;
    expect(debug).toHaveBeenCalledWith(expect.stringContaining('no tenants'));
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it('publishes MessageEvent for non-group data messages', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();

    const ws = FakeWebSocket.instances[0];
    const payload = JSON.stringify({ envelope: { dataMessage: { message: 'hi' } }, account: '+48111' });
    ws.emit('message', Buffer.from(payload));
    await flushMicrotasks();

    expect(detector.detect).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const evt = eventBus.publish.mock.calls[0][0] as MessageEvent;
    expect(evt.tenantId).toBe('t-1');
    expect(evt.platform).toBe(Platform.Signal);
  });

  it('skips publishing when binding detector handles the message', async () => {
    detector.detect.mockResolvedValue(true);
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();

    const ws = FakeWebSocket.instances[0];
    ws.emit(
      'message',
      Buffer.from(JSON.stringify({ envelope: { dataMessage: { message: 'og-abcd23' } }, account: '+48111' })),
    );
    await flushMicrotasks();

    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('drops group messages and non-data envelopes', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();

    const ws = FakeWebSocket.instances[0];
    ws.emit('message', Buffer.from(JSON.stringify({ envelope: { typingMessage: {} } })));
    ws.emit('message', Buffer.from(JSON.stringify({ envelope: { dataMessage: { groupInfo: { groupId: 'g' } } } })));
    await flushMicrotasks();

    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('logs error on malformed payload and keeps the connection alive', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();

    const ws = FakeWebSocket.instances[0];
    ws.emit('message', Buffer.from('not-json'));
    await flushMicrotasks();

    const err = (manager as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Failed to handle Signal message'));
  });

  it('refreshTenant invalidates cache, closes existing WS, and reopens with new config', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([
      { tenantId: 't-1', config: makeCfg({ account: '+48111' }) },
    ]);
    await manager.onModuleInit();
    const oldWs = FakeWebSocket.instances[0];

    await manager.refreshTenant('t-1', makeCfg({ account: '+48222', apiUrl: 'http://signal:8080' }));

    expect(platformConfig.invalidate).toHaveBeenCalledWith('t-1', 'signal');
    expect(oldWs.terminated).toBe(true);
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.instances[1].url).toContain(encodeURIComponent('+48222'));
  });

  it('refreshTenant fetches config when not provided inline', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([]);
    await manager.onModuleInit();
    platformConfig.getConfig.mockResolvedValue(makeCfg({ account: '+48333' }));

    await manager.refreshTenant('t-9');
    expect(platformConfig.getConfig).toHaveBeenCalledWith('t-9', 'signal');
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('refreshTenant just closes the WS when next config is null/incomplete', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const ws = FakeWebSocket.instances[0];

    await manager.refreshTenant('t-1', { apiUrl: '', account: '' });

    expect(ws.terminated).toBe(true);
  });

  it('reconcile reopens when account changed', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValueOnce([
      { tenantId: 't-1', config: makeCfg({ account: '+48111' }) },
    ]);
    await manager.onModuleInit();
    const first = FakeWebSocket.instances[0];

    platformConfig.getTenantsWithPlatform.mockResolvedValueOnce([
      { tenantId: 't-1', config: makeCfg({ account: '+48999' }) },
    ]);
    await (manager as unknown as { reconcile: () => Promise<void> }).reconcile();

    expect(first.terminated).toBe(true);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });

  it('reconcile drops a tenant whose credentials disappeared', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValueOnce([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const ws = FakeWebSocket.instances[0];

    platformConfig.getTenantsWithPlatform.mockResolvedValueOnce([]);
    await (manager as unknown as { reconcile: () => Promise<void> }).reconcile();

    expect(ws.terminated).toBe(true);
  });

  it('onModuleDestroy terminates all open connections and clears the timer', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const ws = FakeWebSocket.instances[0];

    manager.onModuleDestroy();

    expect(ws.terminated).toBe(true);
    expect((manager as unknown as { reconcileTimer: NodeJS.Timeout | null }).reconcileTimer).toBeNull();
  });

  it('reconnects after a WS close (skip when destroyed)', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const first = FakeWebSocket.instances[0];

    first.emit('close');
    jest.advanceTimersByTime(2000);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });

  it('on open: resets reconnect delay back to the minimum', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const ws = FakeWebSocket.instances[0];
    ws.emit('close');
    jest.advanceTimersByTime(2000);
    const reconnected = FakeWebSocket.instances[1];

    reconnected.emit('open');
    const conn = (manager as unknown as { connections: Map<string, { reconnectDelay: number }> }).connections.get(
      't-1',
    );
    expect(conn?.reconnectDelay).toBe(2000);
  });

  it('on error: logs warn and keeps the connection', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const ws = FakeWebSocket.instances[0];
    ws.emit('error', new Error('handshake failed'));

    const warn = (manager as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('handshake failed'));
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('on ping: replies with pong (no throw)', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const ws = FakeWebSocket.instances[0];
    expect(() => ws.emit('ping')).not.toThrow();
  });

  it('reconcile timer interval triggers another reconcile (catch-up loop)', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([]);
    await manager.onModuleInit();

    platformConfig.getTenantsWithPlatform.mockResolvedValueOnce([{ tenantId: 't-late', config: makeCfg() }]);
    jest.advanceTimersByTime(5 * 60_000);
    await flushMicrotasks();

    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('reconcile timer logs warn when reconcile rejects', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([]);
    await manager.onModuleInit();

    platformConfig.getTenantsWithPlatform.mockRejectedValueOnce(new Error('grpc down'));
    jest.advanceTimersByTime(5 * 60_000);
    await flushMicrotasks();

    const warn = (manager as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('grpc down'));
  });

  it('does not reconnect when the connection was destroyed before close', async () => {
    platformConfig.getTenantsWithPlatform.mockResolvedValue([{ tenantId: 't-1', config: makeCfg() }]);
    await manager.onModuleInit();
    const first = FakeWebSocket.instances[0];

    manager.onModuleDestroy();
    first.emit('close');
    jest.advanceTimersByTime(60000);

    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});

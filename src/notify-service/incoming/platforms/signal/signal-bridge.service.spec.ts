type WsHandler = (...args: unknown[]) => void;

class FakeWebSocket {
  url: string;
  handlers: Record<string, WsHandler[]> = {};
  pongCalls = 0;
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
    this.pongCalls++;
  }

  emit(event: string, ...args: unknown[]): void {
    (this.handlers[event] ?? []).forEach((fn) => fn(...args));
  }
}

jest.mock('ws', () => ({
  __esModule: true,
  WebSocket: jest.fn().mockImplementation((url: string) => new FakeWebSocket(url)),
}));

import { EventBus } from '@nestjs/cqrs';
import { Platform } from '../../../types/platform';
import { MessageEvent } from '../../event/message.event';
import { SignalBridgeService } from './signal-bridge.service';

describe('SignalBridgeService', () => {
  let eventBus: jest.Mocked<EventBus>;
  let service: SignalBridgeService;

  beforeEach(() => {
    jest.useFakeTimers();
    FakeWebSocket.instances = [];
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    service = new SignalBridgeService(eventBus);
    jest
      .spyOn((service as unknown as { logger: { warn: jest.Mock; log: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((service as unknown as { logger: { log: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens a single WebSocket on init and resets reconnect delay on open', () => {
    service.onModuleInit();

    expect(FakeWebSocket.instances).toHaveLength(1);
    const ws = FakeWebSocket.instances[0];
    expect(ws.url).toContain('ws://signal_bridge:8080/v1/receive/');

    ws.emit('open');
    expect((service as unknown as { reconnectDelay: number }).reconnectDelay).toBe(2000);
  });

  it('publishes MessageEvent for data messages without groupInfo', () => {
    service.onModuleInit();
    const ws = FakeWebSocket.instances[0];

    const payload = { envelope: { dataMessage: { message: 'hi' } }, account: '+1' };
    ws.emit('message', Buffer.from(JSON.stringify(payload)));

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const evt = eventBus.publish.mock.calls[0][0] as MessageEvent;
    expect(evt).toBeInstanceOf(MessageEvent);
    expect(evt.platform).toBe(Platform.Signal);
  });

  it('drops group messages and non-data messages', () => {
    service.onModuleInit();
    const ws = FakeWebSocket.instances[0];

    ws.emit('message', Buffer.from(JSON.stringify({ envelope: { typingMessage: {} }, account: '+1' })));
    ws.emit(
      'message',
      Buffer.from(JSON.stringify({ envelope: { dataMessage: { groupInfo: { groupId: 'g' } } }, account: '+1' })),
    );

    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('responds to pings with pong', () => {
    service.onModuleInit();
    const ws = FakeWebSocket.instances[0];

    ws.emit('ping');
    expect(ws.pongCalls).toBe(1);
  });

  it('logs WS errors without throwing', () => {
    service.onModuleInit();
    const ws = FakeWebSocket.instances[0];
    const warn = (service as unknown as { logger: { warn: jest.Mock } }).logger.warn;

    ws.emit('error', new Error('handshake failed'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('handshake failed'));
  });

  it('reconnects with exponential backoff capped at 30s on close', () => {
    service.onModuleInit();
    const first = FakeWebSocket.instances[0];

    first.emit('close');
    jest.advanceTimersByTime(2000);
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect((service as unknown as { reconnectDelay: number }).reconnectDelay).toBe(4000);

    const second = FakeWebSocket.instances[1];
    second.emit('close');
    jest.advanceTimersByTime(4000);
    expect(FakeWebSocket.instances).toHaveLength(3);
    expect((service as unknown as { reconnectDelay: number }).reconnectDelay).toBe(8000);
  });
});

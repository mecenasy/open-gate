import { of, throwError } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import type { EventBus } from '@nestjs/cqrs';
import { Platform } from '../../types/platform';
import { Type } from '../../types/unified-message';
import { MessageEvent } from '../event/message.event';
import { AttachmentEvent } from '../event/attachment-event';
import { Transform } from '../platforms/transformer';
import { MessageBridgeHandler } from './message-bridge.handler';
import type { UnifiedMessage } from '../../types/unified-message';

class FakeSignalTransform extends Transform {
  platform = Platform.Signal;
  private next: UnifiedMessage = {
    platform: Platform.Signal,
    chatId: '+1',
    authorId: '+1',
    messageId: 'm-1',
    type: Type.Text,
    content: 'hi',
    raw: {},
  };

  setNext(msg: UnifiedMessage): void {
    this.next = msg;
  }

  async transform(): Promise<UnifiedMessage> {
    return this.next;
  }
}

describe('MessageBridgeHandler.handle', () => {
  let transformer: FakeSignalTransform;
  let receiveMessage: jest.Mock;
  let grpc: jest.Mocked<ClientGrpc>;
  let eventBus: jest.Mocked<EventBus>;
  let handler: MessageBridgeHandler;

  beforeEach(() => {
    transformer = new FakeSignalTransform();
    receiveMessage = jest.fn().mockReturnValue(of({ status: true } as never));
    grpc = {
      getService: jest.fn().mockReturnValue({ receiveMessage }),
    } as unknown as jest.Mocked<ClientGrpc>;
    eventBus = { publish: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<EventBus>;

    handler = new MessageBridgeHandler([transformer], grpc, eventBus);
    handler.onModuleInit();
    jest
      .spyOn((handler as unknown as { logger: { error: jest.Mock; log: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
    jest
      .spyOn((handler as unknown as { logger: { log: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
  });

  it('throws when no transformer matches the platform', async () => {
    await expect(handler.handle(new MessageEvent({}, Platform.Whatsapp, 't-1'))).rejects.toThrow(
      /No transformer found for platform whatsapp/,
    );
  });

  it('publishes AttachmentEvent (no gRPC) when transformed message has media', async () => {
    transformer.setNext({
      platform: Platform.Signal,
      chatId: '+1',
      authorId: '+1',
      messageId: 'm-1',
      type: Type.Image,
      media: { url: 'a.jpg', contentType: 'image/jpeg' },
      raw: {},
    });

    await handler.handle(new MessageEvent({}, Platform.Signal, 't-1'));

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(AttachmentEvent);
    expect(receiveMessage).not.toHaveBeenCalled();
  });

  it('forwards a text message to core-service over gRPC with x-tenant-id metadata', async () => {
    await handler.handle(new MessageEvent({}, Platform.Signal, 't-1'));

    expect(receiveMessage).toHaveBeenCalledTimes(1);
    const [body, metadata] = receiveMessage.mock.calls[0];
    expect(body).toMatchObject({ status: true, data: expect.objectContaining({ chatId: '+1' }) });
    expect((metadata as { get: (k: string) => string[] }).get('x-tenant-id')).toEqual(['t-1']);
  });

  it('forwards without x-tenant-id when tenant is unset', async () => {
    await handler.handle(new MessageEvent({}, Platform.Signal));

    const [, metadata] = receiveMessage.mock.calls[0];
    expect((metadata as { get: (k: string) => unknown[] }).get('x-tenant-id')).toEqual([]);
  });

  it('logs error and resolves when gRPC publish fails (does not throw)', async () => {
    receiveMessage.mockReturnValue(throwError(() => new Error('UNAVAILABLE')) as never);

    await expect(handler.handle(new MessageEvent({}, Platform.Signal, 't-1'))).resolves.toBeUndefined();
    const err = (handler as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Failed'), expect.any(Error));
  });
});

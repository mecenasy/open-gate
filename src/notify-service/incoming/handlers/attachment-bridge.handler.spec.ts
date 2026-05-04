import { of, throwError } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { Platform } from '../../types/platform';
import { Type, type UnifiedMessage } from '../../types/unified-message';
import { Attachment } from '../platforms/attachment';
import { AttachmentEvent } from '../event/attachment-event';
import { AttachmentBridgeHandler } from './attachment-bridge.handler';

class FakeSignalAttachment extends Attachment {
  platform = Platform.Signal;
  payload: Buffer | null = Buffer.from('jpeg-bytes');
  download = jest.fn(async (): Promise<Buffer> => this.payload as Buffer);
}

function makeMessage(over: Partial<UnifiedMessage> = {}): UnifiedMessage {
  return {
    platform: Platform.Signal,
    chatId: '+1',
    authorId: '+1',
    messageId: 'm-1',
    type: Type.Image,
    media: { url: 'attachment-id', contentType: 'image/jpeg' },
    raw: {},
    ...over,
  };
}

describe('AttachmentBridgeHandler.handle', () => {
  let attachment: FakeSignalAttachment;
  let receiveMessage: jest.Mock;
  let grpc: jest.Mocked<ClientGrpc>;
  let handler: AttachmentBridgeHandler;

  beforeEach(() => {
    attachment = new FakeSignalAttachment();
    receiveMessage = jest.fn().mockReturnValue(of({ status: true } as never));
    grpc = {
      getService: jest.fn().mockReturnValue({ receiveMessage }),
    } as unknown as jest.Mocked<ClientGrpc>;

    handler = new AttachmentBridgeHandler([attachment], grpc);
    handler.onModuleInit();
    jest
      .spyOn((handler as unknown as { logger: { error: jest.Mock; log: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
    jest
      .spyOn((handler as unknown as { logger: { log: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
  });

  it('throws when no attachment downloader matches the platform', async () => {
    await expect(handler.handle(new AttachmentEvent(makeMessage(), Platform.Whatsapp, 't-1'))).rejects.toThrow(
      /No transformer found for platform whatsapp/,
    );
  });

  it('throws when downloader returns empty data', async () => {
    attachment.payload = null;
    await expect(handler.handle(new AttachmentEvent(makeMessage(), Platform.Signal, 't-1'))).rejects.toThrow(
      'No data found',
    );
  });

  it('throws when message has no media url', async () => {
    await expect(
      handler.handle(new AttachmentEvent(makeMessage({ media: undefined }), Platform.Signal, 't-1')),
    ).rejects.toThrow('No data found');
  });

  it('downloads attachment and forwards it to core-service with media data injected', async () => {
    await handler.handle(new AttachmentEvent(makeMessage(), Platform.Signal, 't-1'));

    expect(attachment.download).toHaveBeenCalledTimes(1);
    expect(receiveMessage).toHaveBeenCalledTimes(1);
    const [body, metadata] = receiveMessage.mock.calls[0];
    expect(body.data.media).toEqual(expect.objectContaining({ url: 'attachment-id', data: Buffer.from('jpeg-bytes') }));
    expect((metadata as { get: (k: string) => string[] }).get('x-tenant-id')).toEqual(['t-1']);
  });

  it('does not set tenant metadata when tenant is unset', async () => {
    await handler.handle(new AttachmentEvent(makeMessage(), Platform.Signal));
    const [, metadata] = receiveMessage.mock.calls[0];
    expect((metadata as { get: (k: string) => unknown[] }).get('x-tenant-id')).toEqual([]);
  });

  it('logs (does not throw) when gRPC forward fails', async () => {
    receiveMessage.mockReturnValue(throwError(() => new Error('UNAVAILABLE')) as never);

    await expect(handler.handle(new AttachmentEvent(makeMessage(), Platform.Signal, 't-1'))).resolves.toBeUndefined();

    const err = (handler as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Failed'), expect.any(Error));
  });
});

import { Platform } from '../../types/platform';
import { Type } from '../../types/unified-message';
import type { UnifiedMessage } from '../../types/unified-message';
import { OutgoingNotifyEvent } from '../event/outgoing-notify-event';
import { Sender } from '../platforms/sender';
import { OutgoingNotifyBridgeHandler } from './outdoing-notify.handler';

class FakeSender extends Sender {
  constructor(public platform: Platform) {
    super();
  }
  send = jest.fn().mockResolvedValue(undefined);
}

function makeMsg(): UnifiedMessage {
  return {
    platform: Platform.Signal,
    chatId: '+1',
    authorId: '+1',
    messageId: 'm-1',
    type: Type.Text,
    content: 'hi',
    raw: {},
  };
}

describe('OutgoingNotifyBridgeHandler', () => {
  it('dispatches to every sender whose platform is in the event list', async () => {
    const signal = new FakeSender(Platform.Signal);
    const sms = new FakeSender(Platform.Sms);
    const handler = new OutgoingNotifyBridgeHandler([signal, sms]);

    const msg = makeMsg();
    await handler.handle(new OutgoingNotifyEvent(msg, [Platform.Signal, Platform.Sms]));

    expect(signal.send).toHaveBeenCalledWith(msg);
    expect(sms.send).toHaveBeenCalledWith(msg);
  });

  it('skips platforms with no registered sender', async () => {
    const signal = new FakeSender(Platform.Signal);
    const handler = new OutgoingNotifyBridgeHandler([signal]);

    await handler.handle(new OutgoingNotifyEvent(makeMsg(), [Platform.Whatsapp, Platform.Signal]));

    expect(signal.send).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when platforms list is empty', async () => {
    const signal = new FakeSender(Platform.Signal);
    const handler = new OutgoingNotifyBridgeHandler([signal]);

    await handler.handle(new OutgoingNotifyEvent(makeMsg(), []));
    expect(signal.send).not.toHaveBeenCalled();
  });
});

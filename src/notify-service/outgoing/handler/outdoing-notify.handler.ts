import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OutgoingNotifyEvent } from '../event/outgoing-notify-event';
import { Sender } from '../platforms/sender';

@EventsHandler(OutgoingNotifyEvent)
export class OutgoingNotifyBridgeHandler implements IEventHandler<OutgoingNotifyEvent> {
  constructor(@Inject(Sender) private readonly senders: Sender[]) {}

  async handle({ message, platforms }: OutgoingNotifyEvent): Promise<void> {
    for (const platform of platforms) {
      const sender = this.senders.find((s) => s.platform === platform);
      if (!sender) {
        continue;
      }
      await sender.send(message);
    }
  }
}

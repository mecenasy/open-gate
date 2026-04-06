import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';
import { WebSocket } from 'ws';
import { EventBus } from '@nestjs/cqrs';
import { SignalMessage } from '../types/types';
import { SignalMessageEvent } from './events/signal-message.event';

@Injectable()
export class SignalBridgeService implements OnModuleInit {
  private logger: Logger;
  private observable: Observable<SignalMessage>;
  private subject: Subject<SignalMessage>;
  private signalClient!: WebSocket;

  constructor(private readonly eventBus: EventBus) {
    this.logger = new Logger(SignalBridgeService.name);
    this.subject = new Subject<SignalMessage>();
    this.observable = this.subject.asObservable();
  }

  onModuleInit() {
    this.initSignalConnection();
    this.observer();
  }

  private initSignalConnection() {
    this.signalClient = new WebSocket('ws://signal_bridge:8080/v1/receive/%2B48608447495');

    this.signalClient.on('open', () => {
      this.logger.log('✅ Signal bot has been connected (Protocol: WS)');
    });

    this.signalClient.on('message', (data) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const msg: SignalMessage = JSON.parse(data.toString()) as SignalMessage;
      this.subject.next(msg);
    });
  }

  observer() {
    this.observable
      .pipe(
        filter((msg) => Boolean(msg.envelope?.dataMessage && !msg.envelope.dataMessage?.groupInfo)),
        map((msg) => msg),
      )
      .subscribe((msg) => {
        this.eventBus.publish(new SignalMessageEvent(msg));
      });
  }
}

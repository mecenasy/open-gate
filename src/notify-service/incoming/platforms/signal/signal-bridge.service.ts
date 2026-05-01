import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';
import { WebSocket } from 'ws';
import { EventBus } from '@nestjs/cqrs';
import { SignalMessage } from '../../../types/types';
import { MessageEvent } from '../../event/message.event';
import { Platform } from '../../../types/platform';

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

  private reconnectDelay = 2000;
  private readonly maxReconnectDelay = 30000;

  onModuleInit() {
    this.initSignalConnection();
    this.observer();
  }

  private initSignalConnection() {
    this.signalClient = new WebSocket('ws://signal_bridge:8080/v1/receive/%2B48608447495');

    this.signalClient.on('open', () => {
      this.reconnectDelay = 2000;
      this.logger.log('✅ Signal bot has been connected (Protocol: WS)');
    });

    this.signalClient.on('message', (data) => {
      console.log('🚀 ~ SignalBridgeService ~ initSignalConnection:', data);
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const msg: SignalMessage = JSON.parse(data.toString()) as SignalMessage;
      this.subject.next(msg);
    });

    this.signalClient.on('ping', () => {
      this.signalClient.pong();
    });

    this.signalClient.on('error', (err) => {
      this.logger.warn(`Signal WS error: ${err.message}`);
    });

    this.signalClient.on('close', () => {
      this.logger.warn(`Signal WS closed, reconnecting in ${this.reconnectDelay}ms...`);
      setTimeout(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        this.initSignalConnection();
      }, this.reconnectDelay);
    });
  }

  observer() {
    this.observable
      .pipe(
        filter((msg) => Boolean(msg.envelope?.dataMessage && !msg.envelope.dataMessage?.groupInfo)),
        map((msg) => msg),
      )
      .subscribe((msg) => {
        this.eventBus.publish(new MessageEvent(msg, Platform.Signal));
      });
  }
}

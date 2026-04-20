import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { EventBus } from '@nestjs/cqrs';
import { SignalMessage } from '../../../types/types';
import { MessageEvent } from '../../event/message.event';
import { Platform } from '../../../types/platform';
import { PlatformConfigService, SignalCredentials } from '../../../platform-config/platform-config.service';

interface TenantConnection {
  tenantId: string;
  account: string;
  apiUrl: string;
  ws: WebSocket | null;
  reconnectDelay: number;
  destroyed: boolean;
}

const MIN_RECONNECT_MS = 2_000;
const MAX_RECONNECT_MS = 30_000;

@Injectable()
export class SignalBridgeManager implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SignalBridgeManager.name);
  private readonly connections = new Map<string, TenantConnection>(); // tenantId → connection

  constructor(
    private readonly eventBus: EventBus,
    private readonly platformConfigService: PlatformConfigService,
  ) {}

  async onModuleInit() {
    const tenants = await this.platformConfigService.getTenantsWithPlatform('signal');

    if (tenants.length === 0) {
      this.logger.warn('No tenants with Signal credentials found. Signal bridge inactive.');
      return;
    }

    const fallback = this.platformConfigService.envFallback('signal') as SignalCredentials | null;
    const fallbackApiUrl = fallback?.apiUrl || 'http://signal_bridge:8080';

    let started = 0;
    for (const { tenantId, config } of tenants) {
      const apiUrl = config.apiUrl?.trim() || fallbackApiUrl;
      const account = config.account?.trim();
      if (!account) {
        this.logger.warn(`Skipping Signal bridge [tenant=${tenantId}]: missing account.`);
        continue;
      }
      this.openConnection(tenantId, { ...config, apiUrl, account });
      started++;
    }

    this.logger.log(`Signal bridge started for ${started} tenant(s).`);
  }

  onModuleDestroy() {
    for (const conn of this.connections.values()) {
      conn.destroyed = true;
      conn.ws?.terminate();
    }
    this.connections.clear();
  }

  private openConnection(tenantId: string, config: SignalCredentials) {
    const conn: TenantConnection = {
      tenantId,
      account: config.account,
      apiUrl: config.apiUrl,
      ws: null,
      reconnectDelay: MIN_RECONNECT_MS,
      destroyed: false,
    };
    this.connections.set(tenantId, conn);
    this.connect(conn);
  }

  private connect(conn: TenantConnection) {
    if (conn.destroyed) return;

    const encodedAccount = encodeURIComponent(conn.account);
    const url = `${conn.apiUrl.replace(/^http/, 'ws')}/v1/receive/${encodedAccount}`;

    conn.ws = new WebSocket(url);

    conn.ws.on('open', () => {
      conn.reconnectDelay = MIN_RECONNECT_MS;
      this.logger.log(`✅ Signal connected [tenant=${conn.tenantId}, account=${conn.account}]`);
    });

    conn.ws.on('message', (data) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const msg = JSON.parse(data.toString()) as SignalMessage;
        if (!msg.envelope?.dataMessage || msg.envelope.dataMessage?.groupInfo) return;
        this.eventBus.publish(new MessageEvent(msg, Platform.Signal, conn.tenantId));
      } catch (err) {
        this.logger.error(`Failed to parse Signal message [tenant=${conn.tenantId}]`, err);
      }
    });

    conn.ws.on('ping', () => conn.ws?.pong());

    conn.ws.on('error', (err) => {
      this.logger.warn(`Signal WS error [tenant=${conn.tenantId}]: ${err.message}`);
    });

    conn.ws.on('close', () => {
      if (conn.destroyed) return;
      this.logger.warn(`Signal WS closed [tenant=${conn.tenantId}], reconnecting in ${conn.reconnectDelay}ms`);
      setTimeout(() => {
        conn.reconnectDelay = Math.min(conn.reconnectDelay * 2, MAX_RECONNECT_MS);
        this.connect(conn);
      }, conn.reconnectDelay);
    });
  }
}

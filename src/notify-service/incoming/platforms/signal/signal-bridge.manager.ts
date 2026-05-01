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
/**
 * Catch-up loop for tenants that gained Signal credentials *after* this
 * service booted (e.g. wizard finished while we were already running).
 * The refreshTenant() hook handles the immediate case for onboarding,
 * but it relies on an in-process call — a tenant created via direct
 * upsert without going through the onboarding flow would otherwise be
 * invisible until the next restart.
 */
const RECONCILE_INTERVAL_MS = 5 * 60_000;

@Injectable()
export class SignalBridgeManager implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SignalBridgeManager.name);
  private readonly connections = new Map<string, TenantConnection>(); // tenantId → connection
  private reconcileTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly eventBus: EventBus,
    private readonly platformConfigService: PlatformConfigService,
  ) {}

  async onModuleInit() {
    await this.reconcile();
    this.reconcileTimer = setInterval(() => {
      this.reconcile().catch((err) => this.logger.warn(`Signal bridge reconcile failed: ${String(err)}`));
    }, RECONCILE_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.reconcileTimer) {
      clearInterval(this.reconcileTimer);
      this.reconcileTimer = null;
    }
    for (const conn of this.connections.values()) {
      conn.destroyed = true;
      conn.ws?.terminate();
    }
    this.connections.clear();
  }

  /**
   * Public hook used by the onboarding flow when credentials change. Closes
   * any stale WS for the tenant and (re)opens with `nextConfig` if provided,
   * else re-fetches via PlatformConfigService.
   */
  async refreshTenant(tenantId: string, nextConfig?: SignalCredentials): Promise<void> {
    this.platformConfigService.invalidate(tenantId, 'signal');
    const config = nextConfig ?? (await this.platformConfigService.getConfig(tenantId, 'signal'));
    if (!config?.account || !config.apiUrl) {
      this.closeConnection(tenantId);
      return;
    }
    this.closeConnection(tenantId);
    this.openConnection(tenantId, config);
    this.logger.log(`Signal bridge refreshed [tenant=${tenantId}].`);
  }

  private async reconcile(): Promise<void> {
    const tenants = await this.platformConfigService.getTenantsWithPlatform('signal');
    if (tenants.length === 0 && this.connections.size === 0) {
      this.logger.debug('Signal reconcile: no tenants with credentials.');
      return;
    }

    const fallback = this.platformConfigService.envFallback('signal') as SignalCredentials | null;
    const fallbackApiUrl = fallback?.apiUrl || 'http://signal_bridge:8080';

    const desired = new Map<string, SignalCredentials>();
    for (const { tenantId, config } of tenants) {
      const apiUrl = config.apiUrl?.trim() || fallbackApiUrl;
      const account = config.account?.trim();
      if (!account) continue;
      desired.set(tenantId, { ...config, apiUrl, account });
    }

    // Add missing / re-open if endpoint changed.
    for (const [tenantId, cfg] of desired.entries()) {
      const existing = this.connections.get(tenantId);
      if (!existing) {
        this.openConnection(tenantId, cfg);
        continue;
      }
      if (existing.account !== cfg.account || existing.apiUrl !== cfg.apiUrl) {
        this.closeConnection(tenantId);
        this.openConnection(tenantId, cfg);
      }
    }

    // Drop tenants that no longer have credentials.
    for (const tenantId of [...this.connections.keys()]) {
      if (!desired.has(tenantId)) {
        this.closeConnection(tenantId);
      }
    }
  }

  private closeConnection(tenantId: string): void {
    const conn = this.connections.get(tenantId);
    if (!conn) return;
    conn.destroyed = true;
    conn.ws?.terminate();
    this.connections.delete(tenantId);
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
    console.log('🚀 ~ SignalBridgeManager ~ connect ~ url:', url);

    conn.ws = new WebSocket(url);

    conn.ws.on('open', () => {
      conn.reconnectDelay = MIN_RECONNECT_MS;
      this.logger.log(`✅ Signal connected [tenant=${conn.tenantId}, account=${conn.account}]`);
    });

    conn.ws.on('message', (data) => {
      console.log('🚀 ~ SignalBridgeManager ~ connect ~ data:', data);
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

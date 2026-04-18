export enum TenantResolutionSource {
  SESSION = 'session',
  SUBDOMAIN = 'subdomain',
  HEADER = 'header',
  GUARD = 'guard',
}

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  correlationId: string;
  resolutionSource: TenantResolutionSource;
  userId?: string;
}

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    tenant_id?: string;
    user_id?: string;
    csrfToken?: string;
    currentChallenge?: string;
  }
}

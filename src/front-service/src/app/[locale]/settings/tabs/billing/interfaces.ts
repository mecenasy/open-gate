export type PlanChangeKind = 'initial' | 'upgrade' | 'downgrade' | 'same';
export type SubscriptionChangeAuditKind = 'initial' | 'upgrade' | 'downgrade' | 'cancel';

export interface PlanSummary {
  id: string;
  code: string;
  name: string;
  maxTenants: number;
  maxPlatformsPerTenant: number;
  maxContactsPerTenant: number;
  maxStaffPerTenant: number;
  maxCustomCommandsPerTenant: number;
  priceCents: number;
  currency: string;
  isActive?: boolean;
}

export interface SubscriptionSummary {
  id: string;
  status: string;
  startedAt: string;
  plan: PlanSummary;
}

export interface QuotaViolation {
  kind: string;
  tenantId?: string | null;
  current: number;
  max: number;
}

export interface PlanChangePreview {
  kind: PlanChangeKind;
  deltaPriceCents: number;
  newPlan: PlanSummary;
  currentPlan?: PlanSummary | null;
  violations: QuotaViolation[];
}

export interface UsagePerTenant {
  tenantId: string;
  staff: number;
  platforms: number;
  contacts: number;
  customCommands: number;
}

export interface UsageReport {
  billingUserId: string;
  tenants: number;
  perTenant: UsagePerTenant[];
}

export interface SubscriptionChangeEntry {
  id: string;
  oldPlanId?: string | null;
  newPlanId?: string | null;
  kind: SubscriptionChangeAuditKind;
  initiatedAt: string;
}

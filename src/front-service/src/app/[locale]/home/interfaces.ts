export interface SubscriptionPlanSummary {
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
}

export interface MySubscriptionSummary {
  id: string;
  status: string;
  plan: SubscriptionPlanSummary;
}

export interface TenantSummary {
  id: string;
  slug: string;
  billingUserId?: string | null;
  isActive: boolean;
}

export interface StaffMembershipSummary {
  tenantId: string;
  tenantSlug: string;
  role: string;
}

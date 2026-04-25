'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/components/navigation/navigation';
import { TabPanels, Tabs } from '@/components/ui';
import type { TabDef } from '@/components/ui';
import { TENANT_SETTINGS_TABS } from './constants';
import type { TenantSettingsTabKey } from './interfaces';
import { useTenantSettings } from './hooks/use-tenant-settings';
import { GeneralTab } from './tabs/general/GeneralTab';
import { BrandingTab } from './tabs/branding/BrandingTab';
import { FeaturesTab } from './tabs/features/FeaturesTab';
import { MessagingTab } from './tabs/messaging/MessagingTab';
import { CommandsTab } from './tabs/commands/CommandsTab';
import { ComplianceTab } from './tabs/compliance/ComplianceTab';
import { StaffTab } from './tabs/staff/StaffTab';

interface SettingsViewProps {
  slug: string;
}

function isValidTab(value: string | null): value is TenantSettingsTabKey {
  return TENANT_SETTINGS_TABS.includes(value as TenantSettingsTabKey);
}

export function SettingsView({ slug }: SettingsViewProps) {
  const t = useTranslations('tenantSettings');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { tenant, isMember, branding, features, messaging, commands, compliance, staff, isLoading } =
    useTenantSettings(slug);

  const raw = searchParams.get('tab');
  const activeTab: TenantSettingsTabKey = isValidTab(raw) ? raw : 'general';

  const tabs: TabDef[] = TENANT_SETTINGS_TABS.map((key) => ({ key, label: t(`tab_${key}`) }));

  const handleTabChange = (key: string) => {
    router.push(`${pathname}?tab=${key}`);
  };

  if (isLoading && !tenant) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </main>
    );
  }

  if (!isMember || !tenant) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center flex flex-col gap-3">
        <h1 className="text-xl font-bold text-text">{t('notFoundTitle')}</h1>
        <p className="text-sm text-muted">{t('notFoundDesc', { slug })}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">{t('breadcrumb')}</span>
        <h1 className="text-xl font-bold text-text">{t('title', { slug: tenant.slug })}</h1>
      </header>
      <Tabs tabs={tabs} active={activeTab} onChange={handleTabChange} />
      <TabPanels
        activeKey={activeTab}
        panels={{
          general: (
            <GeneralTab
              tenantId={tenant.id}
              slug={tenant.slug}
              isActive={tenant.isActive}
              billingUserId={tenant.billingUserId}
            />
          ),
          branding: branding ? <BrandingTab tenantId={tenant.id} branding={branding} /> : null,
          features: features ? <FeaturesTab tenantId={tenant.id} features={features} /> : null,
          messaging: messaging ? <MessagingTab tenantId={tenant.id} messaging={messaging} /> : null,
          commands: commands ? <CommandsTab tenantId={tenant.id} commands={commands} /> : null,
          compliance: compliance ? <ComplianceTab tenantId={tenant.id} compliance={compliance} /> : null,
          staff: <StaffTab tenantId={tenant.id} staff={staff} />,
        }}
      />
    </main>
  );
}

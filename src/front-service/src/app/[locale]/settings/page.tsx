'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/components/navigation/navigation';
import { Tabs } from '@/components/ui';
import type { TabDef } from '@/components/ui';
import { AuthTab } from './tabs/auth/AuthTab';
import { FeatureSettingsTab } from './tabs/feature-settings/FeatureSettingsTab';
import { FeatureTab } from './tabs/feature/FeatureTab';
import { CommandsTab } from './tabs/CommandsTab';
import { PromptsTab } from './tabs/prompts/PromptsTab';

const TABS = ['auth', 'feature', 'feature-settings', 'commands', 'prompts'] as const;
type TabKey = (typeof TABS)[number];

function isValidTab(value: string | null): value is TabKey {
  return TABS.includes(value as TabKey);
}

function SettingsContent() {
  const t = useTranslations('settings');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get('tab');
  const activeTab: TabKey = isValidTab(raw) ? raw : 'auth';

  const tabs: TabDef[] = [
    { key: 'auth', label: t('tabAuth') },
    { key: 'feature', label: t('tabFeature') },
    { key: 'feature-settings', label: t('tabFeatureSettings') },
    { key: 'commands', label: t('tabCommands') },
    { key: 'prompts', label: t('tabPrompts') },
  ];

  const handleTabChange = (key: string) => {
    router.push(`${pathname}?tab=${key}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-xl font-bold text-text mb-8">{t('title')}</h1>
      <Tabs tabs={tabs} active={activeTab} onChange={handleTabChange} />
      {activeTab === 'auth' && <AuthTab />}
      {activeTab === 'feature' && <FeatureTab />}
      {activeTab === 'feature-settings' && <FeatureSettingsTab />}
      {activeTab === 'commands' && <CommandsTab />}
      {activeTab === 'prompts' && <PromptsTab />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

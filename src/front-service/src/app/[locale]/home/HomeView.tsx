'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/components/navigation/navigation';
import { Button } from '@/components/ui';
import { useHomeData } from './hooks/use-home-data';
import { PlanPicker } from './components/PlanPicker';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { MyTenantsSection } from './components/MyTenantsSection';
import { CoManagedSection } from './components/CoManagedSection';

export function HomeView() {
  const t = useTranslations('home');
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <PublicLanding />;
  }

  return <AuthenticatedDashboard />;
}

function PublicLanding() {
  const t = useTranslations('home');

  return (
    <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold text-text tracking-tight">{t('title')}</h1>
        <p className="text-muted text-sm">{t('subtitle')}</p>
      </div>
    </main>
  );
}

function AuthenticatedDashboard() {
  const t = useTranslations('home');
  const router = useRouter();
  const { subscription, plans, myTenants, staffMemberships, isLoading } = useHomeData();

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </main>
    );
  }

  if (!subscription) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-text">{t('welcome')}</h1>
          <p className="text-sm text-muted mt-1">{t('noSubscriptionDesc')}</p>
        </header>
        <PlanPicker plans={plans} currentSubscription={null} />
      </main>
    );
  }

  const hasAnyTenant = myTenants.length > 0 || staffMemberships.length > 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-text">{t('dashboardTitle')}</h1>
        <SubscriptionBanner subscription={subscription} />
      </header>

      {!hasAnyTenant ? (
        <section className="flex flex-col items-center gap-3 bg-surface-raised border border-border rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold text-text">{t('noTenantsTitle')}</h2>
          <p className="text-sm text-muted">{t('noTenantsDesc')}</p>
          <Button type="button" variant="blue" onClick={() => router.push('/tenants/new')}>
            {t('createFirstTenant')}
          </Button>
        </section>
      ) : (
        <>
          <MyTenantsSection tenants={myTenants} maxTenants={subscription.plan.maxTenants} />
          <CoManagedSection memberships={staffMemberships} />
        </>
      )}
    </main>
  );
}

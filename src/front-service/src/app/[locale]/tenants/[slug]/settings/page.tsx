import { PreloadQuery, query } from '@/lib/apollo/server';
import { GET_HOME_DATA_QUERY } from '@/app/[locale]/home/hooks/queries';
import { TENANT_SETTINGS_QUERY } from './hooks/queries';
import { SettingsView } from './SettingsView';

interface Props {
  params: Promise<{ slug: string }>;
}

async function resolveTenantId(slug: string): Promise<string | null> {
  try {
    const { data } = await query({ query: GET_HOME_DATA_QUERY });
    if (!data) return null;
    const owned = data.myTenants?.find((t) => t.slug === slug);
    if (owned) return owned.id;
    const staffed = data.tenantsIStaffAt?.find((m) => m.tenantSlug === slug);
    return staffed?.tenantId ?? null;
  } catch {
    return null;
  }
}

export default async function TenantSettingsPage({ params }: Props) {
  const { slug } = await params;
  const tenantId = await resolveTenantId(slug);

  if (!tenantId) {
    return (
      <PreloadQuery query={GET_HOME_DATA_QUERY}>
        <SettingsView slug={slug} />
      </PreloadQuery>
    );
  }

  return (
    <PreloadQuery query={GET_HOME_DATA_QUERY}>
      <PreloadQuery query={TENANT_SETTINGS_QUERY} variables={{ tenantId }}>
        <SettingsView slug={slug} />
      </PreloadQuery>
    </PreloadQuery>
  );
}

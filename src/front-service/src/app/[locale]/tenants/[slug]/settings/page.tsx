import { SettingsView } from './SettingsView';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TenantSettingsPage({ params }: Props) {
  const { slug } = await params;
  return <SettingsView slug={slug} />;
}

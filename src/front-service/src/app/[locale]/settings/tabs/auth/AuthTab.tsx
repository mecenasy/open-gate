'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import adaptiveIcon from '@/assets/adaptive.svg';
import tfaIcon from '@/assets/tfa.svg';
import passkeyIcon from '@/assets/webauthn.svg';
import { SettingCard } from './components/SettingCard';
import { PasskeyList } from './components/PasskeyList';
import { RemovePasskeyModal } from './components/RemovePasskeyModal';
import { TfaSetupModal } from './components/TfaSetupModal';
import { useAdaptiveLogin } from './hooks/use-adaptive-login';
import { use2faToggle } from './hooks/use-2fa-toggle';
import { usePasskeyToggle } from './hooks/use-passkey-toggle';
import { usePasskeysList } from './hooks/use-passkeys-list';

interface KeyToRemove {
  id: string;
  credentialID: string;
  deviceName: string;
}

export function AuthTab() {
  const t = useTranslations('settings');
  const { user, isLoading } = useAuth();

  const [keyToRemove, setKeyToRemove] = useState<KeyToRemove | null>(null);

  const adaptive = useAdaptiveLogin(user?.isAdaptiveLoginEnabled ?? false);
  const tfa = use2faToggle(user?.is2faEnabled ?? false);
  const passkey = usePasskeyToggle();
  const passkeys = usePasskeysList();

  const showPasskeySetup = !passkeys.hasLocalDevice && !passkey.isEnabled;

  const confirmRemove = async () => {
    if (!keyToRemove) return;
    await passkeys.removeKey(keyToRemove.id, keyToRemove.credentialID);
    setKeyToRemove(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        <SettingCard
          icon={adaptiveIcon}
          title={t('adaptiveTitle')}
          description={t('adaptiveDesc')}
          checked={adaptive.isEnabled}
          onChange={() => adaptive.toggle()}
          disabled={adaptive.isPending}
        />
        <SettingCard
          icon={tfaIcon}
          title={t('tfaTitle')}
          description={t('tfaDesc')}
          checked={tfa.isEnabled}
          onChange={tfa.toggle}
          disabled={tfa.isPending}
        />
        {showPasskeySetup && (
          <SettingCard
            icon={passkeyIcon}
            title={t('passkeyTitle')}
            description={t('passkeyDesc')}
            checked={passkey.isEnabled}
            onChange={passkey.toggle}
            disabled={passkey.isPending}
          />
        )}
        {tfa.serverError && (
          <p className="text-sm text-red-400">{tfa.serverError}</p>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-text mb-3">{t('keysSectionTitle')}</h2>
        <PasskeyList
          keys={passkeys.keys}
          isLoading={passkeys.isLoading}
          onRemove={(key) => setKeyToRemove({
            id: key.id,
            credentialID: key.credentialID,
            deviceName: key.deviceName || 'Passkey',
          })}
        />
      </section>

      <RemovePasskeyModal
        deviceName={keyToRemove?.deviceName ?? null}
        onClose={() => setKeyToRemove(null)}
        onConfirm={confirmRemove}
      />

      <TfaSetupModal
        qrCode={tfa.qrCode}
        onClose={tfa.cancelSetup}
        onVerified={tfa.closeQr}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { useAdaptiveLogin } from '@/hooks/use-adaptive-login';
import { use2faToggle } from '@/hooks/use-2fa-toggle';
import { use2fa } from '@/hooks/use-2fa';
import { useWebAuthnToggle } from '@/hooks/use-webauthn-toggle';
import { useWebAuthnSettings } from '@/hooks/use-webauthn-settings';
import { Toggle, Modal, Input, Button } from '@/components/ui';
import adaptiveIcon from '@/assets/adaptive.svg';
import tfaIcon from '@/assets/tfa.svg';
import passkeyIcon from '@/assets/webauthn.svg';
import closeIcon from '@/assets/close.svg';

/* ─── PasskeyRow ─────────────────────────────────────────────────────── */

interface PasskeyRowProps {
  deviceName: string;
  addedLabel: string;
  isCurrent: boolean;
  currentLabel: string;
  removeLabel: string;
  onRemove: () => void;
}

function PasskeyRow({
  deviceName,
  addedLabel,
  isCurrent,
  currentLabel,
  removeLabel,
  onRemove,
}: PasskeyRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 bg-surface border border-border rounded-2xl">
      <div className="flex items-start gap-4 min-w-0">
        <Image
          src={passkeyIcon}
          alt=""
          width={22}
          height={22}
          className="nav-icon mt-0.5 shrink-0"
          unoptimized
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text truncate">{deviceName}</p>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {currentLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-1">{addedLabel}</p>
        </div>
      </div>

      <div className="scale-90 origin-right shrink-0">
        <Button
          variant="red"
          size="sm"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <Image
            src={closeIcon}
            alt=""
            width={12}
            height={12}
            className="invert"
            unoptimized
          />
        </Button>
      </div>
    </div>
  );
}

/* ─── SettingCard ────────────────────────────────────────────────────── */

interface SettingCardProps {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SettingCard({ icon, title, description, checked, onChange, disabled }: SettingCardProps) {
  return (
    <div className="flex items-center justify-between gap-6 p-5 bg-surface border border-border rounded-2xl">
      <div className="flex items-start gap-4">
        <Image
          src={icon}
          alt=""
          width={22}
          height={22}
          className="nav-icon mt-0.5 shrink-0"
          unoptimized
        />
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-xs text-muted mt-1 max-w-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const { user, isLoading } = useAuth();
  const [showPasskeySetup, setShowPasskeySetup] = useState(true);

  const [qrCode, setQrCode] = useState('');
  const [keyToRemove, setKeyToRemove] = useState<{
    id: string;
    credentialID: string;
    deviceName: string;
  } | null>(null);

  const adaptive = useAdaptiveLogin(user?.isAdaptiveLoginEnabled ?? false);
  const tfa = use2faToggle(user?.is2faEnabled ?? false, setQrCode);
  const cancelTfaSetup = tfa.cancelSetup;
  const tfaVerify = use2fa(user?.email ?? '', () => setQrCode(''));
  const webauthn = useWebAuthnToggle((show) => !show && setQrCode(''));
  const passkeys = useWebAuthnSettings(setShowPasskeySetup);

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  const closeRemoveModal = () => setKeyToRemove(null);
  const confirmRemove = async () => {
    if (!keyToRemove) return;
    await passkeys.onRemoveKey(keyToRemove.id, keyToRemove.credentialID);
    closeRemoveModal();
  };

  const isCurrentDevice = (credentialID: string) =>
    typeof window !== 'undefined' &&
    window.localStorage.getItem(`webauthn_${credentialID}`) === 'true';

  const toEvent = (checked: boolean) =>
    ({ target: { checked } }) as React.ChangeEvent<HTMLInputElement>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold text-text mb-8">{t('title')}</h1>

      <div className="flex flex-col gap-3">
        <SettingCard
          icon={adaptiveIcon}
          title={t('adaptiveTitle')}
          description={t('adaptiveDesc')}
          checked={adaptive.isEnabled}
          onChange={() => adaptive.handleToggleChange()}
          disabled={adaptive.isPending}
        />

        <SettingCard
          icon={tfaIcon}
          title={t('tfaTitle')}
          description={t('tfaDesc')}
          checked={tfa.isEnabled}
          onChange={(checked) => tfa.handleToggleChange(toEvent(checked))}
          disabled={tfa.isPending}
        />

        {showPasskeySetup && <SettingCard
          icon={passkeyIcon}
          title={t('passkeyTitle')}
          description={t('passkeyDesc')}
          checked={Boolean(webauthn.isEnabled)}
          onChange={(checked) => webauthn.handleToggleChange(toEvent(checked))}
          disabled={webauthn.isPending}
        />}
      </div>

      {/* WebAuthn keys list */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold text-text mb-3">
          {t('keysSectionTitle')}
        </h2>

        {passkeys.isLoading ? (
          <div className="flex items-center justify-center p-6 bg-surface border border-border rounded-2xl">
            <div className="w-5 h-5 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
          </div>
        ) : !passkeys.keys || passkeys.keys.length === 0 ? (
          <div className="p-5 bg-surface border border-border rounded-2xl text-center text-sm text-muted">
            {t('keysEmpty')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {passkeys.keys.map((key) => {
              const addedDate = dateFormatter.format(new Date(key.createAt));
              return (
                <PasskeyRow
                  key={key.id}
                  deviceName={key.deviceName || 'Passkey'}
                  addedLabel={t('keyAddedAt', { date: addedDate })}
                  isCurrent={isCurrentDevice(key.credentialID)}
                  currentLabel={t('currentDevice')}
                  removeLabel={t('removeKey')}
                  onRemove={() =>
                    setKeyToRemove({
                      id: key.id,
                      credentialID: key.credentialID,
                      deviceName: key.deviceName || 'Passkey',
                    })
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Remove passkey confirmation modal */}
      <Modal
        isOpen={!!keyToRemove}
        onClose={closeRemoveModal}
        title={t('removeKeyTitle')}
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeRemoveModal}>
              {t('cancel')}
            </Button>
            <Button variant="red" size="sm" onClick={confirmRemove}>
              {t('remove')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted leading-relaxed">
          {t('removeKeyConfirm', { name: keyToRemove?.deviceName ?? '' })}
        </p>
      </Modal>

      {/* QR code modal — shown after enabling 2FA */}
      <Modal isOpen={!!qrCode} onClose={cancelTfaSetup} title={t('qrModalTitle')}>
        <div className="flex flex-col items-center gap-6">
          <img
            src={qrCode}
            alt="QR code"
            className="w-48 h-48 rounded-xl border border-border"
          />

          <p className="text-sm text-muted text-center leading-relaxed">
            {t('qrInstruction')}
          </p>

          <form onSubmit={tfaVerify.onSubmit} className="w-full flex flex-col gap-4">
            <Input
              id="tfa-code"
              label={t('verifyCode')}
              type="text"
              inputMode="numeric"
              placeholder={t('verifyCodePlaceholder')}
              error={tfaVerify.errors.code?.message}
              {...tfaVerify.register('code')}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="blue" size="sm" disabled={tfaVerify.isPending}>
                {tfaVerify.isPending ? t('confirming') : t('confirm')}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

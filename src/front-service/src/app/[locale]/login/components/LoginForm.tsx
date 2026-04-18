'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Input, Button } from '@/components/ui';
import passkeyIcon from '@/assets/webauthn.svg';
import { AuthStatus } from '@/app/gql/graphql';
import { useLogin } from '../hooks/use-login';
import { useWebAuthnLogin } from '../hooks/use-webauthn-login';

interface LoginFormProps {
  onVerifyNeeded: (request: { email: string; type: AuthStatus }) => void;
  onQr: () => void;
  onCancel: () => void;
}

export function LoginForm({ onVerifyNeeded, onQr, onCancel }: LoginFormProps) {
  const t = useTranslations('login');
  const { register, errors, onSubmit, loading, serverError } = useLogin(onVerifyNeeded);
  const passkey = useWebAuthnLogin();

  const disabled = loading || passkey.isPending;
  const error = serverError ?? passkey.serverError;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        label={t('email')}
        type="email"
        placeholder={t('emailPlaceholder')}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        id="password"
        label={t('password')}
        type="password"
        placeholder={t('passwordPlaceholder')}
        error={errors.password?.message}
        {...register('password')}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="red" size="sm" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" variant="blue" size="sm" disabled={disabled}>
          {loading ? t('submitting') : t('submit')}
        </Button>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted">{t('or')}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="[&>button]:w-full">
        <Button
          type="button"
          variant="green"
          size="sm"
          onClick={passkey.login}
          disabled={disabled}
        >
          <span className="flex items-center justify-center gap-2">
            <Image src={passkeyIcon} alt="" width={16} height={16} className="invert" unoptimized />
            {passkey.isPending ? t('submitting') : t('passkeyLogin')}
          </span>
        </Button>
      </div>

      <div className="[&>button]:w-full">
        <Button type="button" variant="blue" size="sm" onClick={onQr} disabled={disabled}>
          {t('qrLogin')}
        </Button>
      </div>
    </form>
  );
}

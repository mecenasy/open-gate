'use client';

import { useLocale, useTranslations } from 'next-intl';
import { PasskeyRow } from './PasskeyRow';
import { isCurrentDevice } from '../helpers';

interface Passkey {
  id: string;
  createAt: string;
  deviceName: string;
  credentialID: string;
}

interface PasskeyListProps {
  keys: readonly Passkey[] | undefined;
  isLoading: boolean;
  onRemove: (key: Passkey) => void;
}

export function PasskeyList({ keys, isLoading, onRemove }: PasskeyListProps) {
  const t = useTranslations('settings');
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-surface border border-border rounded-2xl">
        <div className="w-5 h-5 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!keys || keys.length === 0) {
    return (
      <div className="p-5 bg-surface border border-border rounded-2xl text-center text-sm text-muted">
        {t('keysEmpty')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {keys.map((key) => {
        const addedDate = dateFormatter.format(new Date(key.createAt));
        return (
          <PasskeyRow
            key={key.id}
            deviceName={key.deviceName || 'Passkey'}
            addedLabel={t('keyAddedAt', { date: addedDate })}
            isCurrent={isCurrentDevice(key.credentialID)}
            currentLabel={t('currentDevice')}
            removeLabel={t('removeKey')}
            onRemove={() => onRemove(key)}
          />
        );
      })}
    </div>
  );
}

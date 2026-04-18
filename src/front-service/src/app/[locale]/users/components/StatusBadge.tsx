'use client';

import { useTranslations } from 'next-intl';
import { BADGE_FALLBACK, STATUS_BADGE, STATUS_LABEL_KEYS } from '../constants';

interface StatusBadgeProps {
  value: string;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const t = useTranslations('users');
  const style = STATUS_BADGE[value] ?? BADGE_FALLBACK;
  const labelKey = STATUS_LABEL_KEYS[value];
  const label = labelKey ? t(labelKey) : value;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { BADGE_FALLBACK, ROLE_BADGE, ROLE_LABEL_KEYS } from '../constants';

interface RoleBadgeProps {
  value: string;
}

export function RoleBadge({ value }: RoleBadgeProps) {
  const t = useTranslations('users');
  const style = ROLE_BADGE[value] ?? BADGE_FALLBACK;
  const labelKey = ROLE_LABEL_KEYS[value];
  const label = labelKey ? t(labelKey) : value;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

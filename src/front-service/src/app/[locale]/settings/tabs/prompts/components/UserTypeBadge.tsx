import { PromptUserType } from '@/app/gql/graphql';
import { BADGE_FALLBACK, USER_TYPE_BADGE } from '../constants';

interface UserTypeBadgeProps {
  value: string;
  label: string;
}

export function UserTypeBadge({ value, label }: UserTypeBadgeProps) {
  const cfg = USER_TYPE_BADGE[value as PromptUserType] ?? BADGE_FALLBACK;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}

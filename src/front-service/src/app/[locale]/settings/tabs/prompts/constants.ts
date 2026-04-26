import { PromptUserType } from '@/app/gql/graphql';
import type { SelectOption } from '@/components/ui';

type BadgeStyle = { dot: string; pill: string };

export const USER_TYPE_BADGE: Record<PromptUserType, BadgeStyle> = {
  [PromptUserType.Owner]: { dot: 'bg-rose-700', pill: 'bg-rose-800/20 text-rose-500 border border-rose-800/30' },
  [PromptUserType.SuperUser]: { dot: 'bg-red-500', pill: 'bg-red-500/15 text-red-400 border border-red-500/20' },
  [PromptUserType.Admin]: {
    dot: 'bg-orange-400',
    pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  },
  [PromptUserType.Member]: {
    dot: 'bg-blue-500',
    pill: 'bg-blue-500/15 text-blue-400 light:text-blue-600 border border-blue-500/30',
  },
  [PromptUserType.User]: {
    dot: 'bg-slate-500',
    pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50',
  },
  [PromptUserType.Unrecognized]: {
    dot: 'bg-gray-500',
    pill: 'bg-gray-500/20 text-gray-400 light:text-gray-600 border border-gray-400/50',
  },
};

export const BADGE_FALLBACK: BadgeStyle = {
  dot: 'bg-slate-500',
  pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50',
};

export const USER_TYPE_LABEL_KEYS: Record<PromptUserType, string> = {
  [PromptUserType.Owner]: 'userTypeOwner',
  [PromptUserType.SuperUser]: 'userTypeSuperUser',
  [PromptUserType.Admin]: 'userTypeAdmin',
  [PromptUserType.Member]: 'userTypeMember',
  [PromptUserType.User]: 'userTypeUser',
  [PromptUserType.Unrecognized]: 'userTypeUnrecognized',
};

export const USER_TYPE_VALUES = [
  PromptUserType.Owner,
  PromptUserType.SuperUser,
  PromptUserType.User,
  PromptUserType.Member,
] as const;

export const LANG_OPTIONS: SelectOption<string>[] = [
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'uk', label: 'Українська' },
];

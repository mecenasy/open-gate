import type { SelectOption } from '@/components/ui';

type BadgeStyle = { dot: string; pill: string };

export const USER_TYPE_VALUES = {
  Owner: 'owner',
  Admin: 'admin',
  SuperUser: 'super_user',
  Member: 'member',
  User: 'user',
} as const;

export const ROLE_BADGE: Record<string, BadgeStyle> = {
  owner: { dot: 'bg-rose-700', pill: 'bg-rose-800/20 text-rose-500 border border-rose-800/30' },
  super_user: { dot: 'bg-red-500', pill: 'bg-red-500/15 text-red-400 border border-red-500/20' },
  admin: { dot: 'bg-orange-400', pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20' },
  member: { dot: 'bg-blue-500', pill: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  user: { dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 border border-slate-400/50' },
};

export const BADGE_FALLBACK: BadgeStyle = {
  dot: 'bg-slate-500',
  pill: 'bg-slate-500/20 text-slate-400 border border-slate-400/50',
};

export const ROLE_LABEL_KEYS: Record<string, string> = {
  [USER_TYPE_VALUES.Owner]: 'roleOwner',
  [USER_TYPE_VALUES.SuperUser]: 'roleSuperUser',
  [USER_TYPE_VALUES.Admin]: 'roleAdmin',
  [USER_TYPE_VALUES.Member]: 'roleMember',
  [USER_TYPE_VALUES.User]: 'roleUser',
};

export const LANG_OPTIONS: SelectOption<string>[] = [
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'uk', label: 'Українська' },
];

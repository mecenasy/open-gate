import { UserRole, UserStatus } from '@/app/gql/graphql';

type BadgeStyle = { dot: string; pill: string };

export const STATUS_BADGE: Record<string, BadgeStyle> = {
  [UserStatus.Active]: {
    dot: 'bg-emerald-400',
    pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  },
  [UserStatus.Pending]: {
    dot: 'bg-amber-400',
    pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  },
  [UserStatus.Suspended]: {
    dot: 'bg-orange-400',
    pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  },
  [UserStatus.Banned]: {
    dot: 'bg-slate-500',
    pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50',
  },
};

export const ROLE_BADGE: Record<string, BadgeStyle> = {
  [UserRole.Owner]: {
    dot: 'bg-rose-700',
    pill: 'bg-rose-800/20 text-rose-500 border border-rose-800/30',
  },
  [UserRole.SuperUser]: {
    dot: 'bg-red-500',
    pill: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
  [UserRole.Admin]: {
    dot: 'bg-orange-400',
    pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  },
  [UserRole.Member]: {
    dot: 'bg-blue-500',
    pill: 'bg-blue-500/15 text-blue-400 light:text-blue-600 border border-blue-500/30',
  },
  [UserRole.User]: {
    dot: 'bg-slate-500',
    pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50',
  },
};

export const BADGE_FALLBACK: BadgeStyle = {
  dot: 'bg-slate-500',
  pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50',
};

export const STATUS_LABEL_KEYS: Record<string, string> = {
  [UserStatus.Active]: 'statusActive',
  [UserStatus.Pending]: 'statusPending',
  [UserStatus.Suspended]: 'statusSuspended',
  [UserStatus.Banned]: 'statusBanned',
};

export const ROLE_LABEL_KEYS: Record<string, string> = {
  [UserRole.Owner]: 'roleOwner',
  [UserRole.SuperUser]: 'roleSuperUser',
  [UserRole.Admin]: 'roleAdmin',
  [UserRole.Member]: 'roleMember',
  [UserRole.User]: 'roleUser',
};

export const STATUS_VALUES = [UserStatus.Pending, UserStatus.Active, UserStatus.Suspended, UserStatus.Banned] as const;
export const ROLE_VALUES = [UserRole.Owner, UserRole.Admin, UserRole.SuperUser, UserRole.Member, UserRole.User] as const;

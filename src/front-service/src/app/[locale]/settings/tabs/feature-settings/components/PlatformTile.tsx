'use client';

import Image from 'next/image';
import configIcon from '@/assets/config.svg';

interface PlatformTileProps {
  isDefault: boolean;
  label: string;
  defaultBadge: string;
  onClick: () => void;
}

export function PlatformTile({ isDefault, label, defaultBadge, onClick }: PlatformTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-6 p-5 bg-surface border border-border rounded-2xl w-full text-left hover:border-blue-500/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <Image src={configIcon} alt="" width={22} height={22} className="nav-icon mt-0.5 shrink-0" unoptimized />
        <p className="text-sm font-semibold text-text">{label}</p>
      </div>
      {isDefault && (
        <span className="text-xs text-muted border border-border rounded-full px-2 py-0.5 shrink-0">
          {defaultBadge}
        </span>
      )}
    </button>
  );
}

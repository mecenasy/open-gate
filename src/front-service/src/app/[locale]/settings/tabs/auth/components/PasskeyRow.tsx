'use client';

import Image from 'next/image';
import { Button } from '@/components/ui';
import passkeyIcon from '@/assets/webauthn.svg';
import closeIcon from '@/assets/close.svg';

interface PasskeyRowProps {
  deviceName: string;
  addedLabel: string;
  isCurrent: boolean;
  currentLabel: string;
  removeLabel: string;
  onRemove: () => void;
}

export function PasskeyRow({ deviceName, addedLabel, isCurrent, currentLabel, removeLabel, onRemove }: PasskeyRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 bg-surface border border-border rounded-2xl">
      <div className="flex items-start gap-4 min-w-0">
        <Image src={passkeyIcon} alt="" width={22} height={22} className="nav-icon mt-0.5 shrink-0" unoptimized />
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
        <Button variant="red" size="sm" onClick={onRemove} aria-label={removeLabel}>
          <Image src={closeIcon} alt="" width={12} height={12} className="invert" unoptimized />
        </Button>
      </div>
    </div>
  );
}

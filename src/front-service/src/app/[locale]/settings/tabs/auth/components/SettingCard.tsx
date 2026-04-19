'use client';

import Image from 'next/image';
import { Toggle } from '@/components/ui';

interface SettingCardProps {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingCard({ icon, title, description, checked, onChange, disabled }: SettingCardProps) {
  return (
    <div className="flex items-center justify-between gap-6 p-5 bg-surface border border-border rounded-2xl">
      <div className="flex items-start gap-4">
        <Image src={icon} alt="" width={22} height={22} className="nav-icon mt-0.5 shrink-0" unoptimized />
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-xs text-muted mt-1 max-w-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

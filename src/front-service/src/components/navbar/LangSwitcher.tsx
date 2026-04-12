'use client';

import Image from 'next/image';
import { usePathname, useRouter } from '@/components/navigation/navigation';
import { useLocale } from 'next-intl';
import plFlag from '@/assets/poland.png';
import enFlag from '@/assets/uk.png';

export function LangSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = (next: 'pl' | 'en') => {
    router.replace(pathname, { locale: next, scroll: false });
  };

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-surface-raised border border-border">
      <button
        onClick={() => switchLocale('pl')}
        aria-label="Polski"
        className={[
          'p-1.5 rounded-md transition-colors',
          locale === 'pl'
            ? 'bg-active ring-1 ring-border'
            : 'hover:bg-hover opacity-50 hover:opacity-80',
        ].join(' ')}
      >
        <Image src={plFlag} alt="PL" width={20} height={14} className="rounded-sm" unoptimized />
      </button>
      <button
        onClick={() => switchLocale('en')}
        aria-label="English"
        className={[
          'p-1.5 rounded-md transition-colors',
          locale === 'en'
            ? 'bg-active ring-1 ring-border'
            : 'hover:bg-hover opacity-50 hover:opacity-80',
        ].join(' ')}
      >
        <Image src={enFlag} alt="EN" width={20} height={14} className="rounded-sm" unoptimized />
      </button>
    </div>
  );
}

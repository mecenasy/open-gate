'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import moon from '@/assets/moon.svg';
import sun from '@/assets/sun.svg';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-1.5 rounded-md transition-colors text-muted hover:text-text hover:bg-hover"
    >
      <Image src={isDark ? sun : moon} alt="" width={18} height={18} />
    </button>
  );
}

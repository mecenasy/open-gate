"use client";

import moon from '@/assets/moon.svg';
import sun from '@/assets/sun.svg';
import { useTheme } from '@/context/theme';
import Image from 'next/image';

const MoonIcon = () => (
  <Image src={moon} alt="moon icon" width={18} height={18} />
);

const SunIcon = () => (
  <Image src={sun} alt="sun icon" width={18} height={18} />
);

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  console.log("🚀 ~ ThemeToggle ~ theme:", theme)

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-1.5 rounded-md transition-colors text-muted hover:text-text hover:bg-hover"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
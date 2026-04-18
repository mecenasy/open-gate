import { Link } from '@/components/navigation/navigation';
import { LangSwitcher } from './LangSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-30 w-full bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <ThemeToggle />
          <Link
            href="/"
            className="text-text font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
          >
            Open Gate
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}

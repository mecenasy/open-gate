'use client';

import { usePathname } from '@/components/navigation/navigation';
import { useAuth } from '@/hooks/use-auth';
import { NavIconLink, NavIconButton } from './NavIconButton';
import loginIcon from '@/assets/login.svg';
import registrationIcon from '@/assets/registration.svg';
import logoutIcon from '@/assets/logout.svg';
import settingsIcon from '@/assets/settings.svg';

export function AuthNav() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="w-18 h-9" />;
  }

  if (isAuthenticated) {
    return (
      <>
        <NavIconLink href="/settings" icon={settingsIcon} alt="Settings" active={pathname === '/settings'} />
        <NavIconButton onClick={logout} icon={logoutIcon} alt="Logout" />
      </>
    );
  }

  return (
    <>
      <NavIconLink href="/login" icon={loginIcon} alt="Login" active={pathname === '/login'} />
      <NavIconLink href="/registration" icon={registrationIcon} alt="Registration" active={pathname === '/registration'} />
    </>
  );
}

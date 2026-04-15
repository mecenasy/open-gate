'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/components/navigation/navigation';
import { useAuth } from '@/hooks/use-auth';

const PUBLIC_PATHS = ['/', '/login', '/registration', '/reset-password', '/forgot-password'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.endsWith(p));
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isOwner } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicPath(pathname)) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && !isOwner && (pathname === '/core-config' || pathname.endsWith('/core-config'))) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, isOwner, pathname, router]);

  return <>{children}</>;
}

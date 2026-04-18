import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { HOME_PATH, LOGIN_PATH, OWNER_ONLY_PATHS, PUBLIC_PATHS } from './constants/auth';
import { checkSession } from './lib/auth/check-session';

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_SEGMENT = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);

function stripLocale(pathname: string): { locale: string; path: string } {
  const match = pathname.match(LOCALE_SEGMENT);
  if (!match) return { locale: routing.defaultLocale, path: pathname };
  return { locale: match[1], path: pathname.slice(match[0].length) || '/' };
}

function matchesAny(path: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => path === p || path.startsWith(`${p}/`));
}

export default async function middleware(req: NextRequest) {
  const intlResponse = intlMiddleware(req);
  if (intlResponse.headers.get('location')) return intlResponse;

  const { locale, path } = stripLocale(req.nextUrl.pathname);

  if (matchesAny(path, PUBLIC_PATHS)) return intlResponse;

  const cookieHeader = req.headers.get('cookie') ?? '';
  const session = await checkSession(cookieHeader);

  if (!session.authenticated) {
    return NextResponse.redirect(new URL(`/${locale}${LOGIN_PATH}`, req.url));
  }

  if (matchesAny(path, OWNER_ONLY_PATHS) && !session.isOwner) {
    return NextResponse.redirect(new URL(`/${locale}${HOME_PATH}`, req.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

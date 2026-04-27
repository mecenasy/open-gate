import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { GUEST_ONLY_PATHS, HOME_PATH, LOGIN_PATH, PUBLIC_PATHS } from './constants/auth';
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

  const isPublic = matchesAny(path, PUBLIC_PATHS);
  const isGuestOnly = matchesAny(path, GUEST_ONLY_PATHS);

  if (isPublic && !isGuestOnly) return intlResponse;

  const cookieHeader = req.headers.get('cookie') ?? '';
  const session = await checkSession(cookieHeader);

  if (isGuestOnly) {
    if (session.authenticated) {
      return NextResponse.redirect(new URL(`/${locale}${HOME_PATH}`, req.url));
    }
    return intlResponse;
  }

  if (!session.authenticated) {
    return NextResponse.redirect(new URL(`/${locale}${LOGIN_PATH}`, req.url));
  }

  return intlResponse;
}

export const config = {
  // signal-captcha is a same-origin proxy popup that hosts the hCaptcha
  // widget for Signal registration. It must NOT go through next-intl
  // (no locale redirect) or the auth gate (popup must work without a
  // session) — exclude it from the middleware matcher entirely.
  matcher: ['/((?!api|_next|_vercel|signal-captcha|.*\\..*).*)'],
};

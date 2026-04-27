const BFF_URL = `${process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_HOST_URL}/graphql`;

const STATUS_QUERY = `query Status {
  loginStatus {
    status
    user { owner }
  }
}`;

interface LoginStatusPayload {
  data?: {
    loginStatus: {
      status: string;
      user: { owner: boolean } | null;
    };
  };
}

export interface SessionResult {
  authenticated: boolean;
  isOwner: boolean;
}

interface CacheEntry {
  result: SessionResult;
  expiresAt: number;
  inflight?: Promise<SessionResult>;
}

const POSITIVE_TTL_MS = 30_000;
const NEGATIVE_TTL_MS = 3_000;
const MAX_CACHE_ENTRIES = 500;

const globalScope = globalThis as typeof globalThis & {
  __sessionCache?: Map<string, CacheEntry>;
};

const sessionCache: Map<string, CacheEntry> =
  globalScope.__sessionCache ?? (globalScope.__sessionCache = new Map());

function pruneCache(now: number) {
  if (sessionCache.size < MAX_CACHE_ENTRIES) return;
  for (const [key, entry] of sessionCache) {
    if (entry.expiresAt <= now) sessionCache.delete(key);
  }
  if (sessionCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = sessionCache.keys().next().value;
    if (firstKey !== undefined) sessionCache.delete(firstKey);
  }
}

async function fetchSession(cookieHeader: string): Promise<SessionResult> {
  try {
    const res = await fetch(BFF_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({ query: STATUS_QUERY }),
      cache: 'no-store',
    });

    if (!res.ok) return { authenticated: false, isOwner: false };

    const json = (await res.json()) as LoginStatusPayload;
    const login = json.data?.loginStatus;

    return {
      authenticated: login?.status === 'login',
      isOwner: login?.user?.owner === true,
    };
  } catch {
    return { authenticated: false, isOwner: false };
  }
}

export async function checkSession(cookieHeader: string): Promise<SessionResult> {
  if (!cookieHeader) return { authenticated: false, isOwner: false };

  const now = Date.now();
  const cached = sessionCache.get(cookieHeader);

  if (cached) {
    if (cached.inflight) return cached.inflight;
    if (cached.expiresAt > now) return cached.result;
  }

  const inflight = fetchSession(cookieHeader);
  sessionCache.set(cookieHeader, {
    result: cached?.result ?? { authenticated: false, isOwner: false },
    expiresAt: cached?.expiresAt ?? 0,
    inflight,
  });

  const result = await inflight;
  const ttl = result.authenticated ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
  sessionCache.set(cookieHeader, { result, expiresAt: Date.now() + ttl });
  pruneCache(Date.now());

  return result;
}

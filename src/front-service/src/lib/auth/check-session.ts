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

export async function checkSession(cookieHeader: string): Promise<SessionResult> {
  if (!cookieHeader) return { authenticated: false, isOwner: false };

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

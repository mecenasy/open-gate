'use client';

import { ApolloProvider } from '@apollo/client/react';
import { InMemoryCache, HttpLink, ApolloClient, from } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

const API_URL = `${process.env.NEXT_PUBLIC_API_HOST_URL}/graphql`;

let cachedCsrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;

  const response = await fetch(API_URL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ csrfToken { csrfToken } }' }),
  });

  const json = (await response.json()) as { data?: { csrfToken?: { csrfToken?: string } } };
  const token = json?.data?.csrfToken?.csrfToken;

  if (!token) throw new Error('Failed to fetch CSRF token');

  cachedCsrfToken = token;
  return token;
}

const csrfLink = new SetContextLink(async (prevContext, operation) => {
  if (operation.operationType !== 'mutation') return prevContext;

  const token = await fetchCsrfToken();
  return {
    ...prevContext,
    headers: {
      ...(prevContext.headers as Record<string, string> | undefined),
      'X-CSRF-Token': token,
    },
  };
});

const httpLink = new HttpLink({
  uri: API_URL,
  credentials: 'include',
});

const client = new ApolloClient({
  link: from([csrfLink, httpLink]),
  cache: new InMemoryCache(),
});

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

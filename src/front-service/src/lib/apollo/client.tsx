'use client';

import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ApolloClient, ApolloNextAppProvider, InMemoryCache } from '@apollo/client-integration-nextjs';
import type { ReactNode } from 'react';

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

function makeClient() {
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

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: csrfLink.concat(httpLink),
  });
}

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { ApolloClient, ApolloNextAppProvider, InMemoryCache } from '@apollo/client-integration-nextjs';
import type { ReactNode } from 'react';

const API_URL = '/api/graphql';

let cachedCsrfToken: string | null = null;
let inflightFetch: Promise<string> | null = null;

async function fetchCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedCsrfToken) return cachedCsrfToken;
  if (inflightFetch) return inflightFetch;

  inflightFetch = (async () => {
    try {
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
    } finally {
      inflightFetch = null;
    }
  })();

  return inflightFetch;
}

function isCsrfError(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((e) => {
      const status = e.extensions?.statusCode;
      const message = typeof e.message === 'string' ? e.message : '';
      return status === 403 && message.includes('CSRF');
    });
  }
  if (ServerError.is(error)) {
    return error.statusCode === 403 && error.bodyText?.includes('CSRF');
  }
  return false;
}

function makeClient() {
  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (operation.operationType !== 'mutation') return;
    if (!isCsrfError(error)) return;
    if (operation.getContext().csrfRetried) return;

    cachedCsrfToken = null;
    operation.setContext({ csrfRetried: true });
    return forward(operation);
  });

  const csrfLink = new SetContextLink(async (prevContext, operation) => {
    if (operation.operationType !== 'mutation') return prevContext;

    const forceRefresh = Boolean((prevContext as { csrfRetried?: boolean }).csrfRetried);
    const token = await fetchCsrfToken(forceRefresh);
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
    link: ApolloLink.from([errorLink, csrfLink, httpLink]),
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

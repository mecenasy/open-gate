import { HttpLink } from '@apollo/client';
import { ApolloClient, InMemoryCache, registerApolloClient } from '@apollo/client-integration-nextjs';
import { cookies } from 'next/headers';

const INTERNAL_API_URL = `${process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_HOST_URL}/graphql`;

export const { getClient, query, PreloadQuery } = registerApolloClient(async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: INTERNAL_API_URL,
      fetchOptions: { cache: 'no-store' },
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    }),
  });
});

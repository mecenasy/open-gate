'use client';

import { ApolloProvider } from '@apollo/client/react';
import { InMemoryCache, HttpLink, ApolloClient } from '@apollo/client';
// import axiosInstance from '@/src/api/api';


let csrfToken: string = '';

// async function initializeApp() {
//   try {
//     const { data } = await axiosInstance.get('/api/csrf/token');
//     const { csrfToken: token } = data;
//     csrfToken = token;
//   } catch (error) {
//     console.error('Failed to get CSRF token:', error);
//   }
// }

// await initializeApp();

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_HOST_URL}/graphql`,
    credentials: 'include',
    // headers: {
    //   'X-CSRF-Token': csrfToken,
    // }
  }),
  cache: new InMemoryCache(),
});

export default function Provider({ children }: { children: React.ReactNode }) {

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
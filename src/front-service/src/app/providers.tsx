'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { ApolloProvider } from '@/lib/apollo/client';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </ApolloProvider>
  );
}

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/app/providers';
import { Navbar } from '@/components/Navbar';
import { AuthGuard } from '@/components/AuthGuard';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Open Gate Frontend',
  description: 'Open Gate Frontend',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'pl' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <AuthGuard>
          <Navbar />
          {children}
        </AuthGuard>
      </Providers>
    </NextIntlClientProvider>
  );
}

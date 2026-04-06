import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ' Open Gate Frontend',
  description: 'Open Gate Frontend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

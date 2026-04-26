import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const BFF_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_HOST_URL ?? 'http://localhost:3001';

const DEV_ORIGINS = (process.env.NEXT_DEV_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: DEV_ORIGINS,
  async rewrites() {
    return [
      { source: '/api/graphql', destination: `${BFF_URL}/graphql` },
      { source: '/api/graphql/:path*', destination: `${BFF_URL}/graphql/:path*` },
      { source: '/api/getaway/:path*', destination: `${BFF_URL}/getaway/:path*` },
    ];
  },
};

export default withNextIntl(nextConfig);

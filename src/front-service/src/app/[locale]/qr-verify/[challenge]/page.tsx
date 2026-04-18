import { QrVerifyView } from './QrVerifyView';

interface QrVerifyPageProps {
  params: Promise<{ challenge: string }>;
  searchParams: Promise<{ nonce: string }>;
}

export default async function QrVerifyPage({ params, searchParams }: QrVerifyPageProps) {
  const { challenge } = await params;
  const { nonce } = await searchParams;

  return <QrVerifyView challenge={challenge} nonce={nonce} />;
}

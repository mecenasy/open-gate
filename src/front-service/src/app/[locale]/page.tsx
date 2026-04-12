import { useTranslations } from 'next-intl';
import { Link } from '@/components/navigation/navigation';

export default function Home() {
  const t = useTranslations('home');

  return (
    <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{t('title')}</h1>
        <p className="text-slate-500 text-sm">{t('subtitle')}</p>
        <Link
          href="/playground"
          className="mt-2 px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium transition-colors"
        >
          {t('designSystem')}
        </Link>
      </div>
    </main>
  );
}

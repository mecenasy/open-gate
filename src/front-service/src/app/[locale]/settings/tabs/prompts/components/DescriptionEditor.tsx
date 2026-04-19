'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button, Select, Textarea } from '@/components/ui';
import { LANG_OPTIONS } from '../constants';

interface DescriptionEditorProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function DescriptionEditor({ value, onChange }: DescriptionEditorProps) {
  const t = useTranslations('prompts');
  const locale = useLocale();

  const usedLangs = Object.keys(value);
  const availableLangs = LANG_OPTIONS.filter((o) => !usedLangs.includes(o.value));

  const preferredLang = availableLangs.some((o) => o.value === locale)
    ? locale
    : (availableLangs[0]?.value ?? '');
  const [newLang, setNewLang] = useState(preferredLang);

  useEffect(() => {
    if (!availableLangs.some((o) => o.value === newLang)) {
      setNewLang(preferredLang);
    }
  }, [availableLangs, newLang, preferredLang]);

  const handleAdd = () => {
    if (!newLang || value[newLang] !== undefined) return;
    onChange({ ...value, [newLang]: '' });
    const next = availableLangs.find((o) => o.value !== newLang);
    if (next) setNewLang(next.value);
  };

  const handleRemove = (lang: string) => {
    const next = { ...value };
    delete next[lang];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-medium text-muted">{t('fieldDescriptions')}</label>
      {usedLangs.map((lang) => (
        <div key={lang} className="flex items-start gap-2">
          <span className="mt-2 text-xs font-mono uppercase text-muted w-8 shrink-0">{lang}</span>
          <div className="flex-1">
            <Textarea
              value={value[lang]}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              rows={2}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(lang)}
            className="mt-2 text-xs text-rose-400 hover:text-rose-300 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
      {availableLangs.length > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-40">
            <Select<string>
              label={t('fieldLanguage')}
              value={newLang}
              options={availableLangs}
              onChange={setNewLang}
            />
          </div>
          <div className="pt-5">
            <Button variant="blue" size="sm" onClick={handleAdd}>{t('addLanguage')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

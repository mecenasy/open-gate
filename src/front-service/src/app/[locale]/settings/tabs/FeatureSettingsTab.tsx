'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { Modal, Button, Input } from '@/components/ui';
import { graphql } from '@/app/gql';
import configIcon from '@/assets/config.svg';

const TENANT_PLATFORM_CREDENTIALS_QUERY = graphql(`
  query TenantPlatformCredentials {
    tenantPlatformCredentials {
      platform
      configJson
      isDefault
    }
  }
`);

const UPDATE_MY_PLATFORM_CREDENTIALS_MUTATION = graphql(`
  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {
    updateMyPlatformCredentials(input: $input) {
      status
      message
    }
  }
`);

type PlatformFields = Record<string, string[]>;

const PLATFORM_FIELDS: PlatformFields = {
  signal: ['apiUrl', 'account'],
  sms: ['sid', 'token', 'phone'],
  smtp: ['host', 'port', 'user', 'password', 'from'],
  whatsapp: ['phoneNumberId', 'accessToken'],
  messenger: ['pageAccessToken', 'pageId'],
};

interface PlatformTileProps {
  platform: string;
  isDefault: boolean;
  label: string;
  defaultBadge: string;
  onClick: () => void;
}

function PlatformTile({ platform, isDefault, label, defaultBadge, onClick }: PlatformTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-6 p-5 bg-surface border border-border rounded-2xl w-full text-left hover:border-blue-500/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <Image src={configIcon} alt="" width={22} height={22} className="nav-icon mt-0.5 shrink-0" unoptimized />
        <p className="text-sm font-semibold text-text">{label}</p>
      </div>
      {isDefault && (
        <span className="text-xs text-muted border border-border rounded-full px-2 py-0.5 shrink-0">
          {defaultBadge}
        </span>
      )}
    </button>
  );
}

interface PlatformConfigModalProps {
  platform: string | null;
  configJson: string;
  onClose: () => void;
}

function PlatformConfigModal({ platform, configJson, onClose }: PlatformConfigModalProps) {
  const t = useTranslations('fetcherSettings');
  const [updateCredentials] = useMutation(UPDATE_MY_PLATFORM_CREDENTIALS_MUTATION);
  const [saving, setSaving] = useState(false);

  const fields = platform ? (PLATFORM_FIELDS[platform] ?? []) : [];
  const parsed = (() => {
    try {
      return JSON.parse(configJson) as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  })();

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f, String(parsed[f] ?? '')])),
  );

  const handleSave = async () => {
    if (!platform) return;
    setSaving(true);
    try {
      await updateCredentials({
        variables: { input: { platform, configJson: JSON.stringify(values) } },
        refetchQueries: ['TenantPlatformCredentials'],
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!platform}
      onClose={onClose}
      title={platform ? t('modalTitle', { platform: t(`platforms.${platform}` as Parameters<typeof t>[0]) }) : ''}
      className="max-w-lg"
      footer={
        <>
          <Button variant="blue" size="sm" onClick={onClose} disabled={saving}>{t('cancel')}</Button>
          <Button variant="blue" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5 overflow-y-auto max-h-[60vh]">
        {fields.map((field) => (
          <Input
            key={field}
            id={`cred-${field}`}
            label={t(`fields.${field}` as Parameters<typeof t>[0])}
            value={values[field] ?? ''}
            onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
          />
        ))}
      </div>
    </Modal>
  );
}

export function FeatureSettingsTab() {
  const t = useTranslations('fetcherSettings');
  const [selectedPlatform, setSelectedPlatform] = useState<{ platform: string; configJson: string } | null>(null);

  const { data, loading } = useQuery(TENANT_PLATFORM_CREDENTIALS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const platforms = data?.tenantPlatformCredentials ?? [];

  if (loading && platforms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {platforms.length === 0 ? (
        <div className="p-5 bg-surface border border-border rounded-2xl text-center text-sm text-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {platforms.map((p) => (
            <PlatformTile
              key={p.platform}
              platform={p.platform}
              isDefault={p.isDefault}
              label={t(`platforms.${p.platform}` as Parameters<typeof t>[0])}
              defaultBadge={t('defaultBadge')}
              onClick={() => setSelectedPlatform({ platform: p.platform, configJson: p.configJson })}
            />
          ))}
        </div>
      )}
      <PlatformConfigModal
        key={selectedPlatform?.platform ?? 'closed'}
        platform={selectedPlatform?.platform ?? null}
        configJson={selectedPlatform?.configJson ?? '{}'}
        onClose={() => setSelectedPlatform(null)}
      />
    </div>
  );
}

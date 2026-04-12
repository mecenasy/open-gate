'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { Modal, Button, Input } from '@/components/ui';
import { graphql } from '@/app/gql';
import configIcon from '@/assets/config.svg';

/* ─── GraphQL ─────────────────────────────────────────────────────────── */

const FEATURE_CONFIGS_QUERY = graphql(`
  query FeatureConfigs {
    featureConfigs {
      data {
        key
        description
      }
      status
      message
    }
  }
`);

const GET_FEATURE_CONFIG_QUERY = graphql(`
  query GetFeatureConfig($input: GetFeatureConfigType!) {
    featureConfig(input: $input) {
      data {
        key
        value
        description
      }
      status
      message
    }
  }
`);

const UPDATE_CONFIG_MUTATION = graphql(`
  mutation UpdateFeatureConfig($input: UpdateConfigType!) {
    updateConfig(input: $input) {
      status
      message
      data {
        key
        value
      }
    }
  }
`);

// TODO: dorobić ponowne pobieranie jeśli core config się zmieni

/* ─── FeatureTile ─────────────────────────────────────────────────────── */

interface FeatureTileProps {
  featureKey: string;
  description: string;
  onClick: () => void;
}

function FeatureTile({ featureKey, description, onClick }: FeatureTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-4 p-5 bg-surface border border-border rounded-2xl text-left w-full hover:border-blue-500/50 transition-colors cursor-pointer"
    >
      <Image
        src={configIcon}
        alt=""
        width={22}
        height={22}
        className="nav-icon mt-0.5 shrink-0"
        unoptimized
      />
      <div>
        <p className="text-sm font-semibold text-text">{featureKey}</p>
        <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

/* ─── FeatureConfigModal ──────────────────────────────────────────────── */

interface FeatureConfigModalProps {
  featureKey: string | null;
  onClose: () => void;
}

function FeatureConfigModal({ featureKey, onClose }: FeatureConfigModalProps) {
  const t = useTranslations('featureConfig');
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, loading } = useQuery(GET_FEATURE_CONFIG_QUERY, {
    fetchPolicy: 'no-cache',
    variables: { input: { key: featureKey! } },
    skip: !featureKey,
  });

  const [updateConfig] = useMutation(UPDATE_CONFIG_MUTATION);

  const configs = data?.featureConfig?.data ?? [];

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        configs.map((cfg) =>
          updateConfig({
            variables: { input: { key: cfg.key, value: values[cfg.key] ?? cfg.value } },
          }),
        ),
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!featureKey}
      onClose={onClose}
      title={featureKey ? t('modalTitle', { key: featureKey }) : ''}
      className="max-w-lg"
      footer={
        <>
          <Button variant="blue" size="sm" onClick={onClose} disabled={saving}>
            {t('cancel')}
          </Button>
          <Button variant="blue" size="sm" onClick={handleSave} disabled={saving || loading}>
            {saving ? t('saving') : t('save')}
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[60vh]">
          {configs.map((cfg) => (
            <div key={cfg.key} className="flex flex-col gap-1.5">
              <Input
                id={`cfg-${cfg.key}`}
                label={cfg.key}
                value={values[cfg.key] ?? cfg.value}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [cfg.key]: e.target.value }))
                }
              />
              {cfg.description && (
                <p className="text-xs text-muted leading-relaxed">{cfg.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function FeatureConfigPage() {
  const t = useTranslations('featureConfig');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { data, loading } = useQuery(FEATURE_CONFIGS_QUERY);
  const features = data?.featureConfigs?.data ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold text-text mb-8">{t('title')}</h1>

      {features.length === 0 ? (
        <div className="p-5 bg-surface border border-border rounded-2xl text-center text-sm text-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {features.map((feature) => (
            <FeatureTile
              key={feature.key}
              featureKey={feature.key}
              description={feature.description}
              onClick={() => setSelectedKey(feature.key)}
            />
          ))}
        </div>
      )}

      <FeatureConfigModal
        key={selectedKey ?? 'closed'}
        featureKey={selectedKey}
        onClose={() => setSelectedKey(null)}
      />
    </div>
  );
}

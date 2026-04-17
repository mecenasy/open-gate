'use client';

export interface TabDef {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-border mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={[
            'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
            active === tab.key
              ? 'text-text border-blue-500'
              : 'text-muted border-transparent hover:text-text hover:border-border',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

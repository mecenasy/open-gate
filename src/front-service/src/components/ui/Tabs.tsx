'use client';

import { useEffect, useRef, useState } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setEdges({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [tabs.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLButtonElement>(`[data-tab-key="${active}"]`);
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [active]);

  return (
    <div className="relative mb-6">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              data-tab-key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={[
                'shrink-0 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 border border-b-0 relative',
                isActive
                  ? 'rounded-t-lg border-border/50 bg-surface text-text shadow-[0_-1px_3px_-1px_rgba(15,23,42,0.06),-1px_0_3px_-2px_rgba(15,23,42,0.04),1px_0_3px_-2px_rgba(15,23,42,0.04)] dark:shadow-[0_-1px_3px_-1px_rgba(0,0,0,0.25),-1px_0_3px_-2px_rgba(0,0,0,0.2),1px_0_3px_-2px_rgba(0,0,0,0.2)]'
                  : 'border-transparent text-muted hover:text-text hover:bg-hover/40',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border/50 pointer-events-none" />
      <div
        className={[
          'pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-bg to-transparent transition-opacity duration-150',
          edges.left ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
      <div
        className={[
          'pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-bg to-transparent transition-opacity duration-150',
          edges.right ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
    </div>
  );
}

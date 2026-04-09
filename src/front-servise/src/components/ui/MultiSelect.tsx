'use client';

import { useEffect, useRef, useState } from 'react';
import { useTransition, useSpring, animated } from '@react-spring/web';
import type { SelectOption } from './Select';

interface MultiSelectProps<T extends string = string> {
  value: T[];
  onChange: (value: T[]) => void;
  options: SelectOption<T>[];
  label?: string;
  disabled?: boolean;
}

export function MultiSelect<T extends string = string>({
  value,
  onChange,
  options,
  label,
  disabled = false,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const chevronSpring = useSpring({
    rotate: open ? 180 : 0,
    config: { tension: 320, friction: 28 },
  });

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen((v) => !v);
  };

  const toggle = (opt: T) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const removeTag = (opt: T, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== opt));
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

  const dropdownTransition = useTransition(open, {
    from: { opacity: 0, y: -6 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: -6 },
    config: { tension: 320, friction: 28 },
  });

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div ref={containerRef} className="relative" onClick={(e) => e.stopPropagation()}>
      {label && <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={[
          'w-full flex items-center justify-between gap-2',
          'bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text',
          'hover:border-muted transition-colors text-left min-h-[38px]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedLabels.length === 0 ? (
            <span className="text-muted">—</span>
          ) : (
            selectedLabels.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-md px-1.5 py-0.5 text-xs font-medium"
              >
                {o.label}
                <span
                  role="button"
                  onClick={(e) => removeTag(o.value, e)}
                  className="text-blue-400/60 hover:text-blue-400 leading-none cursor-pointer"
                >
                  ×
                </span>
              </span>
            ))
          )}
        </span>
        <animated.svg
          style={{ rotate: chevronSpring.rotate.to((r) => `${r}deg`) }}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="shrink-0 text-muted"
        >
          <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </animated.svg>
      </button>

      {dropdownTransition((style, show) =>
        show ? (
          <animated.div
            style={{
              ...style,
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.18)',
            }}
            className="bg-surface border border-border rounded-xl overflow-hidden"
          >
            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={[
                    'w-full flex items-center gap-2 text-left px-3 py-2 text-sm transition-colors',
                    selected ? 'text-blue-500 bg-blue-500/10' : 'text-text hover:bg-hover',
                  ].join(' ')}
                >
                  <span className={[
                    'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                    selected ? 'bg-blue-500 border-blue-500' : 'border-border',
                  ].join(' ')}>
                    {selected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </animated.div>
        ) : null,
      )}
    </div>
  );
}

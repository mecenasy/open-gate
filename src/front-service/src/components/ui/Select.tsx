'use client';

import { useEffect, useRef, useState } from 'react';
import { useTransition, useSpring, animated } from '@react-spring/web';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  disabled?: boolean;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  disabled = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  const chevronSpring = useSpring({
    rotate: open ? 180 : 0,
    config: { tension: 320, friction: 28 },
  });

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen((v) => !v);
  };

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // close on scroll (repositioning would be complex)
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

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      {label && (
        <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      )}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={[
          'w-full flex items-center justify-between gap-2',
          'bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text',
          'hover:border-muted transition-colors text-left',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className="truncate">{currentLabel}</span>
        <animated.svg
          style={{ rotate: chevronSpring.rotate.to((r) => `${r}deg`) }}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="shrink-0 text-muted"
        >
          <path
            d="M2.5 5L7 9.5L11.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={[
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  opt.value === value
                    ? 'text-blue-500 bg-blue-500/10'
                    : 'text-text hover:bg-hover',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </animated.div>
        ) : null,
      )}
    </div>
  );
}

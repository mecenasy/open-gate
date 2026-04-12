'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const labelSpring = useSpring({
      color: error ? '#f87171' : focused ? '#60a5fa' : 'var(--color-muted)',
      config: { tension: 300, friction: 25 },
    });

    const borderSpring = useSpring({
      boxShadow: focused
        ? error
          ? '0 0 0 2px rgba(248,113,113,0.25)'
          : '0 0 0 2px rgba(96,165,250,0.2)'
        : '0 0 0 0px rgba(96,165,250,0)',
      config: { tension: 300, friction: 25 },
    });

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <animated.label
            htmlFor={id}
            style={labelSpring}
            className="text-sm font-medium select-none"
          >
            {label}
          </animated.label>
        )}

        <animated.div style={borderSpring} className="rounded-lg">
          <input
            ref={ref}
            id={id}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={[
              'w-full bg-surface-raised border rounded-lg px-4 py-2.5',
              'text-sm text-text placeholder-muted',
              'outline-none transition-colors',
              error
                ? 'border-red-500/50'
                : focused
                  ? 'border-blue-500/50'
                  : 'border-border',
            ].join(' ')}
            {...props}
          />
        </animated.div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

'use client';

import { useSpring, animated } from '@react-spring/web';
import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'green' | 'blue' | 'red';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  green:
    'bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-400/30 shadow-emerald-900/30',
  blue: 'bg-blue-500 hover:bg-blue-400 text-white border border-blue-400/30 shadow-blue-900/30',
  red: 'bg-red-500 hover:bg-red-400 text-white border border-red-400/30 shadow-red-900/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = 'blue',
  size = 'md',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 380, friction: 22 },
  }));

  return (
    <animated.button
      style={{ scale: spring.scale }}
      onMouseEnter={() => !disabled && api.start({ scale: 1.04 })}
      onMouseLeave={() => api.start({ scale: 1 })}
      onMouseDown={() => !disabled && api.start({ scale: 0.96 })}
      onMouseUp={() => !disabled && api.start({ scale: 1.04 })}
      disabled={disabled}
      className={[
        'rounded-lg font-medium shadow-lg transition-colors cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
      ].join(' ')}
      {...props}
    >
      {children}
    </animated.button>
  );
}

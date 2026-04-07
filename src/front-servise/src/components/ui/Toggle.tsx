'use client';

import { useSpring, animated } from '@react-spring/web';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked = false, onChange, label, disabled }: ToggleProps) {
  const trackSpring = useSpring({
    backgroundColor: checked ? '#3b82f6' : '#1e293b',
    borderColor: checked ? '#60a5fa40' : '#33415540',
    config: { tension: 320, friction: 26 },
  });

  const thumbSpring = useSpring({
    x: checked ? 22 : 2,
    scale: checked ? 1.05 : 1,
    config: { tension: 400, friction: 28 },
  });

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        'inline-flex items-center gap-3 select-none',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <animated.div
        style={trackSpring}
        className="relative w-12 h-6 rounded-full border flex-shrink-0"
      >
        <animated.div
          style={{
            x: thumbSpring.x,
            scale: thumbSpring.scale,
            y: 2,
          }}
          className="absolute top-0 w-4 h-4 bg-white rounded-full shadow-md"
        />
      </animated.div>

      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  );
}

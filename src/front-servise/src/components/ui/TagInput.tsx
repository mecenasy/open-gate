'use client';

import { useRef, useState } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (keys: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagInput({ value, onChange, label, placeholder = 'Add key…' }: TagInputProps) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const key = raw.trim();
    if (!key || value.includes(key)) return;
    onChange([...value, key]);
    setInputVal('');
  };

  const removeTag = (key: string) => {
    onChange(value.filter((k) => k !== key));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && inputVal === '' && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div>
      {label && <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>}
      <div
        className="flex flex-wrap gap-1.5 bg-surface-raised border border-border rounded-lg px-3 py-2 min-h-[38px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((key) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-md px-2 py-0.5 text-xs font-medium"
          >
            {key}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(key); }}
              className="text-blue-400/60 hover:text-blue-400 leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputVal)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-text placeholder:text-muted"
        />
      </div>
    </div>
  );
}

interface KeyBadgesProps {
  record: Record<string, boolean>;
}

export function KeyBadges({ record }: KeyBadgesProps) {
  const keys = Object.keys(record);
  if (keys.length === 0) return <span className="text-muted text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((k) => (
        <span key={k} className="bg-surface border border-border rounded px-1.5 py-0.5 text-xs text-muted">{k}</span>
      ))}
    </div>
  );
}

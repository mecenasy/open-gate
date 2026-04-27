'use client';

interface BusyStepProps {
  label: string;
}

export function BusyStep({ label }: BusyStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="w-8 h-8 border-2 border-muted border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

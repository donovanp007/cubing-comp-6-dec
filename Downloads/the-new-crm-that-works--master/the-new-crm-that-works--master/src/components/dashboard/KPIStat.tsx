import React from 'react';

export function KPIStat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-white/60">{hint}</div>}
    </div>
  );
}
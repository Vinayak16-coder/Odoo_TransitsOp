import { Info } from 'lucide-react';

export function RuleHintBanner({ text, type = 'info' }: { text: string, type?: 'info' | 'error' | 'warning' }) {
  const colors = {
    info: 'text-zinc-400 bg-zinc-900/50 border-zinc-800',
    warning: 'text-amber-400 bg-amber-950/30 border-amber-900/50',
    error: 'text-red-400 bg-red-950/30 border-red-900/50',
  };

  return (
    <div className={`flex items-center gap-2 p-3 text-sm rounded-lg border ${colors[type]}`}>
      <Info className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { statusColorMap } from './statusColorMap';

export function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColorMap[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  
  return (
    <Badge variant="outline" className={`whitespace-nowrap font-medium ${colorClass}`}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

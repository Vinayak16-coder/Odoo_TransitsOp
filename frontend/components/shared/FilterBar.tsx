import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
}

export function FilterBar({ filters }: { filters: FilterConfig[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
      {filters.map(filter => (
        <div key={filter.key} className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">{filter.label}</span>
          <Select value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800">
              <SelectValue placeholder={`Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

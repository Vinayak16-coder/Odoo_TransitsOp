import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  accentColor?: string;
}

export function StatCard({ title, value, icon, description, accentColor }: StatCardProps) {
  return (
    <Card className={`bg-zinc-950 border-zinc-800 ${accentColor ? `border-l-4 ${accentColor}` : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-zinc-100">{value}</div>
        {description && (
          <p className="text-xs text-zinc-500 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

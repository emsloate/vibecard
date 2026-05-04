'use client';

interface ForecastBucket {
  label: string;
  count: number;
  color: string;
}

interface DueForecastProps {
  data: ForecastBucket[];
}

export function DueForecast({ data }: DueForecastProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const colorMap: Record<string, string> = {
    accent: 'bg-accent',
    orange: 'bg-orange-400',
    blue: 'bg-blue-400',
    muted: 'bg-muted/40',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-mono text-muted uppercase tracking-wider">Upcoming Reviews</h3>
        <span className="text-xs font-mono text-muted">{total} total</span>
      </div>

      <div className="space-y-3">
        {data.map((bucket) => (
          <div key={bucket.label} className="flex items-center gap-3">
            <div className="w-20 text-xs font-mono text-muted text-right flex-shrink-0">
              {bucket.label}
            </div>
            <div className="flex-1 bg-card-hover rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[bucket.color] || 'bg-muted/40'}`}
                style={{ width: `${Math.max(bucket.count > 0 ? 4 : 0, (bucket.count / maxCount) * 100)}%` }}
              />
            </div>
            <div className={`w-10 text-xs font-mono text-right flex-shrink-0 ${
              bucket.count > 0 ? 'text-foreground' : 'text-muted'
            }`}>
              {bucket.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

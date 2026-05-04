'use client';

import { useState } from 'react';

interface DayData {
  date: string;
  count: number;
  again: number;
  good: number;
}

interface ActivityHeatmapProps {
  data: DayData[];
}

const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
        <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">Activity</h3>
        <div className="text-sm font-mono text-muted text-center py-8">
          No review data yet. Study some cards to see your activity!
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Organize into weeks (columns) with days (rows)
  // Start from the first Monday on or before the first date
  const firstDate = new Date(data[0].date);
  const dayOfWeek = firstDate.getDay();
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday=0
  
  const weeks: (DayData | null)[][] = [];
  let currentWeek: (DayData | null)[] = [];
  
  // Pad the first week
  for (let i = 0; i < startOffset; i++) {
    currentWeek.push(null);
  }

  for (const day of data) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-card-hover';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity <= 0.25) return 'bg-accent/20';
    if (intensity <= 0.5) return 'bg-accent/40';
    if (intensity <= 0.75) return 'bg-accent/60';
    return 'bg-accent/90';
  };

  // Month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          label: new Date(firstDay.date).toLocaleString('default', { month: 'short' }),
          weekIndex: i,
        });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
      <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">Activity</h3>
      
      <div className="relative overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-1 ml-8" style={{ gap: '0px' }}>
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-[10px] font-mono text-muted"
              style={{
                position: 'relative',
                left: `${m.weekIndex * 14}px`,
                width: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col mr-1" style={{ gap: '2px' }}>
            {DAYS.map((day, i) => (
              <div key={i} className="h-[12px] w-6 text-[9px] font-mono text-muted flex items-center justify-end pr-1">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex" style={{ gap: '2px' }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`h-[12px] w-[12px] rounded-[2px] transition-all duration-150 ${
                      day ? `${getColor(day.count)} hover:ring-1 hover:ring-accent cursor-pointer` : 'bg-transparent'
                    }`}
                    onMouseEnter={(e) => {
                      if (day && day.count > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        });
                        const retention = day.count > 0 ? Math.round((day.good / day.count) * 100) : 0;
                        setTooltip({
                          text: `${formattedDate}: ${day.count} reviews (${retention}% retention)`,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 ml-8">
          <span className="text-[10px] font-mono text-muted">Less</span>
          <div className="h-[10px] w-[10px] rounded-[2px] bg-card-hover" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-accent/20" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-accent/40" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-accent/60" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-accent/90" />
          <span className="text-[10px] font-mono text-muted">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-foreground text-background text-[10px] font-mono px-2 py-1 rounded pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

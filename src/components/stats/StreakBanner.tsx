'use client';

import { Flame, Trophy, Calendar } from 'lucide-react';

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  todayCleared: boolean;
  todayReviewed: number;
}

export function StreakBanner({ currentStreak, longestStreak, todayCleared, todayReviewed }: StreakBannerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Current Streak */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xl flex flex-col items-center justify-center text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
          currentStreak > 0 ? 'bg-orange-500/10' : 'bg-card-hover'
        }`}>
          <Flame size={24} className={currentStreak > 0 ? 'text-orange-400' : 'text-muted'} />
        </div>
        <div className={`text-3xl font-bold font-mono ${currentStreak > 0 ? 'text-orange-400' : 'text-muted'}`}>
          {currentStreak}
        </div>
        <div className="text-xs font-mono text-muted mt-1">Day Streak</div>
      </div>

      {/* Best Streak */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xl flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
          <Trophy size={24} className="text-accent" />
        </div>
        <div className="text-3xl font-bold font-mono text-accent">{longestStreak}</div>
        <div className="text-xs font-mono text-muted mt-1">Best Streak</div>
      </div>

      {/* Today's Reviews */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xl flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
          <Calendar size={24} className="text-blue-400" />
        </div>
        <div className="text-3xl font-bold font-mono text-blue-400">{todayReviewed}</div>
        <div className="text-xs font-mono text-muted mt-1">Reviewed Today</div>
      </div>

      {/* Today's Status */}
      <div className={`border rounded-xl p-5 shadow-xl flex flex-col items-center justify-center text-center ${
        todayCleared
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-card border-border'
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
          todayCleared ? 'bg-green-500/10' : 'bg-card-hover'
        }`}>
          <span className="text-2xl">{todayCleared ? '✓' : '○'}</span>
        </div>
        <div className={`text-sm font-bold font-mono ${todayCleared ? 'text-green-400' : 'text-muted'}`}>
          {todayCleared ? 'Done!' : 'Not yet'}
        </div>
        <div className="text-xs font-mono text-muted mt-1">Today&apos;s Goal</div>
      </div>
    </div>
  );
}

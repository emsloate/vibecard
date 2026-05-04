import { getReviewHistory, getStreakInfo, getDueCardForecast, getDeckProgress, getTodayReviewCount } from '@/app/actions/stats';
import { StreakBanner } from '@/components/stats/StreakBanner';
import { ActivityHeatmap } from '@/components/stats/ActivityHeatmap';
import { DueForecast } from '@/components/stats/DueForecast';
import { DeckProgress } from '@/components/stats/DeckProgress';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const [reviewHistory, streakInfo, forecast, deckProgress, todayCount] = await Promise.all([
    getReviewHistory(105),
    getStreakInfo(),
    getDueCardForecast(),
    getDeckProgress(),
    getTodayReviewCount(),
  ]);

  return (
    <div className="p-8 sm:p-12 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-accent">Stats</h1>
        <p className="text-muted font-mono text-sm mt-1">Track your progress and stay consistent</p>
      </div>

      <StreakBanner
        currentStreak={streakInfo.current}
        longestStreak={streakInfo.longest}
        todayCleared={streakInfo.todayCleared}
        todayReviewed={todayCount}
      />

      <ActivityHeatmap data={reviewHistory} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DueForecast data={forecast} />
        <DeckProgress data={deckProgress} />
      </div>
    </div>
  );
}

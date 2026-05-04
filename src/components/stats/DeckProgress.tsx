'use client';

import Link from 'next/link';

interface DeckData {
  deck_id: string;
  title: string;
  total: number;
  newCount: number;
  learning: number;
  mastered: number;
}

interface DeckProgressProps {
  data: DeckData[];
}

export function DeckProgress({ data }: DeckProgressProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
        <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">Deck Progress</h3>
        <div className="text-sm font-mono text-muted text-center py-8">
          No decks yet. Create a deck to see progress!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
      <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-5">Deck Progress</h3>

      <div className="space-y-5">
        {data.map((deck) => {
          const masteredPct = deck.total > 0 ? (deck.mastered / deck.total) * 100 : 0;
          const learningPct = deck.total > 0 ? (deck.learning / deck.total) * 100 : 0;
          const newPct = deck.total > 0 ? (deck.newCount / deck.total) * 100 : 0;

          return (
            <div key={deck.deck_id}>
              <div className="flex justify-between items-center mb-2">
                <Link
                  href={`/decks/${deck.deck_id}`}
                  className="text-sm font-mono text-foreground hover:text-accent transition-colors truncate"
                >
                  {deck.title}
                </Link>
                <span className="text-xs font-mono text-muted flex-shrink-0 ml-2">
                  {deck.total} cards
                </span>
              </div>

              {/* Stacked progress bar */}
              <div className="w-full bg-card-hover rounded-full h-3 overflow-hidden flex">
                {masteredPct > 0 && (
                  <div
                    className="bg-green-400 h-full transition-all duration-700"
                    style={{ width: `${masteredPct}%` }}
                    title={`Mastered: ${deck.mastered}`}
                  />
                )}
                {learningPct > 0 && (
                  <div
                    className="bg-orange-400 h-full transition-all duration-700"
                    style={{ width: `${learningPct}%` }}
                    title={`Learning: ${deck.learning}`}
                  />
                )}
                {newPct > 0 && (
                  <div
                    className="bg-muted/30 h-full transition-all duration-700"
                    style={{ width: `${newPct}%` }}
                    title={`New: ${deck.newCount}`}
                  />
                )}
              </div>

              {/* Labels */}
              <div className="flex gap-4 mt-1.5 text-[10px] font-mono text-muted">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                  {deck.mastered} mastered
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
                  {deck.learning} learning
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-muted/30" />
                  {deck.newCount} new
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

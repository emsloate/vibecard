import { getStagedCards } from '@/app/actions/card';
import { getDecks } from '@/app/actions/deck';
import { StagedCardItem } from './StagedCardItem';
import { Inbox } from 'lucide-react';

export async function StagingQueue() {
  const [stagedCards, decks] = await Promise.all([
    getStagedCards(),
    getDecks()
  ]);

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded overflow-hidden shadow-xl">
      <div className="p-4 border-b border-border flex justify-between items-center bg-card">
        <div>
          <h2 className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
            <Inbox size={16} /> Staging Area
          </h2>
          <p className="text-xs text-muted font-mono mt-1">Review AI-generated cards</p>
        </div>
        <div className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-mono font-bold">
          {stagedCards?.length || 0} Cards
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-background">
        {stagedCards?.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted text-sm font-mono p-8 border-2 border-dashed border-border rounded">
            Your staging area is empty. Harvest some cards from the Chat Factory!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {stagedCards?.map(card => (
              <StagedCardItem key={card.id} card={card} decks={decks || []} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

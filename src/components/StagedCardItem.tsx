'use client';

import { useState } from 'react';
import { Trash2, Check, Edit2 } from 'lucide-react';
import { approveCard, deleteCard } from '@/app/actions/card';

interface Deck {
  id: string;
  title: string;
}

interface Card {
  id: string;
  front_text: string;
  back_text: string;
}

export function StagedCardItem({ card, decks }: { card: Card, decks: Deck[] }) {
  const [isApproving, setIsApproving] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(decks[0]?.id || '');

  return (
    <div className="bg-card-hover border border-border rounded p-4 group transition-colors">
      <div className="font-mono text-sm mb-3">
        <div className="text-foreground break-words"><span className="text-accent text-xs mr-2">Q:</span>{card.front_text}</div>
        <div className="text-muted break-words mt-1"><span className="text-muted text-xs mr-2">A:</span>{card.back_text}</div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        {isApproving ? (
          <div className="flex gap-2 items-center flex-1">
            <select 
              value={selectedDeck} 
              onChange={e => setSelectedDeck(e.target.value)}
              className="bg-background border border-border text-foreground text-xs font-mono p-1.5 rounded flex-1 focus:outline-none focus:border-accent"
            >
              {decks.length === 0 && <option value="">No decks available</option>}
              {decks.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
            <button 
              onClick={async () => {
                if (selectedDeck) {
                  await approveCard(card.id, selectedDeck);
                  setIsApproving(false);
                }
              }}
              disabled={!selectedDeck}
              className="bg-accent text-black px-2 py-1.5 rounded text-xs font-bold font-mono hover:opacity-90 disabled:opacity-50"
            >
              Confirm
            </button>
            <button 
              onClick={() => setIsApproving(false)}
              className="text-muted hover:text-foreground text-xs font-mono px-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsApproving(true)}
              className="bg-accent/10 text-accent hover:bg-accent hover:text-black border border-accent/20 px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <Check size={14} /> Approve
            </button>
            <button 
              onClick={async () => await deleteCard(card.id, null)}
              className="text-muted hover:text-red-500 border border-border hover:border-red-500/50 px-2 py-1.5 rounded transition-colors"
              title="Trash"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

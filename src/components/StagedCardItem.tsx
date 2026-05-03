'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Check, Plus } from 'lucide-react';
import { approveCard, deleteCard } from '@/app/actions/card';
import { createDeck } from '@/app/actions/deck';
import { LatexText } from './LatexText';

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
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(decks[0]?.id || '__new__');
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');

  const handleApprove = async () => {
    let deckId = selectedDeck;

    // Create new deck if selected
    if (deckId === '__new__') {
      if (!newDeckTitle.trim()) return;
      setIsCreatingDeck(true);
      try {
        const formData = new FormData();
        formData.set('title', newDeckTitle.trim());
        formData.set('description', '');
        const newDeck = await createDeck(formData);
        deckId = newDeck.id;
      } catch (error) {
        console.error('Failed to create deck:', error);
        setIsCreatingDeck(false);
        return;
      }
      setIsCreatingDeck(false);
    }

    if (deckId && deckId !== '__new__') {
      await approveCard(card.id, deckId);
      setIsApproving(false);
      router.refresh();
    }
  };

  return (
    <div className="bg-card-hover border border-border rounded p-4 group transition-colors">
      <div className="font-mono text-sm mb-3">
        <div className="text-foreground break-words"><span className="text-accent text-xs mr-2">Q:</span><LatexText text={card.front_text} /></div>
        <div className="text-muted break-words mt-1"><span className="text-muted text-xs mr-2">A:</span><LatexText text={card.back_text} /></div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        {isApproving ? (
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex gap-2 items-center">
              <select 
                value={selectedDeck} 
                onChange={e => setSelectedDeck(e.target.value)}
                className="bg-background border border-border text-foreground text-xs font-mono p-1.5 rounded flex-1 focus:outline-none focus:border-accent"
              >
                {decks.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
                <option value="__new__">+ New Deck</option>
              </select>
              <button 
                onClick={handleApprove}
                disabled={isCreatingDeck || (selectedDeck === '__new__' && !newDeckTitle.trim())}
                className="bg-accent text-black px-2 py-1.5 rounded text-xs font-bold font-mono hover:opacity-90 disabled:opacity-50"
              >
                {isCreatingDeck ? '...' : 'Confirm'}
              </button>
              <button 
                onClick={() => setIsApproving(false)}
                className="text-muted hover:text-foreground text-xs font-mono px-2"
              >
                Cancel
              </button>
            </div>
            {selectedDeck === '__new__' && (
              <div className="flex gap-2 items-center animate-fade-in">
                <Plus size={12} className="text-accent flex-shrink-0" />
                <input
                  type="text"
                  value={newDeckTitle}
                  onChange={e => setNewDeckTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApprove(); } }}
                  placeholder="New deck name..."
                  autoFocus
                  className="bg-background border border-accent/30 text-foreground text-xs font-mono p-1.5 rounded flex-1 focus:outline-none focus:border-accent"
                />
              </div>
            )}
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
              onClick={async () => { await deleteCard(card.id, null); router.refresh(); }}
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

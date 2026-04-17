'use client';

import { useState, useEffect, useRef } from 'react';
import { createCard } from '@/app/actions/card';
import { Plus, Sparkles } from 'lucide-react';

interface CreateCardFormProps {
  deckId: string;
}

export function CreateCardForm({ deckId }: CreateCardFormProps) {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Clear suggestion if back text is modified manually
    if (backText.length > 0) {
      setSuggestion('');
      return;
    }

    if (frontText.trim().length < 5) {
      setSuggestion('');
      return;
    }

    // Debounce the LLM call
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsPredicting(true);
      try {
        const response = await fetch('/api/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frontText }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestion(data.text);
        }
      } catch (error) {
        console.error('Failed to get autocomplete suggestion', error);
      } finally {
        setIsPredicting(false);
      }
    }, 800); // 800ms debounce

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [frontText, backText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && suggestion && !backText) {
      e.preventDefault();
      setBackText(suggestion);
      setSuggestion('');
    }
  };

  return (
    <form action={createCard} className="flex flex-col gap-4">
      <input type="hidden" name="deck_id" value={deckId} />
      
      <div className="relative">
        <textarea 
          name="front_text" 
          value={frontText}
          onChange={(e) => setFrontText(e.target.value)}
          placeholder="Front side (e.g. What is the Central Limit Theorem?)" 
          className="w-full bg-transparent border border-border p-3 rounded text-sm font-mono focus:outline-none focus:border-accent text-foreground min-h-[80px]"
          required
        />
        {isPredicting && (
          <div className="absolute top-3 right-3 text-accent animate-pulse">
            <Sparkles size={16} />
          </div>
        )}
      </div>

      <div className="relative min-h-[80px]">
        {/* Ghost text overlay */}
        {!backText && suggestion && (
          <div className="absolute inset-0 p-3 text-sm font-mono text-muted pointer-events-none whitespace-pre-wrap overflow-hidden">
            {suggestion}
          </div>
        )}
        
        <textarea 
          name="back_text" 
          ref={backTextRef}
          value={backText}
          onChange={(e) => setBackText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={suggestion ? "" : "Back side..."} 
          className="w-full h-full bg-transparent border border-border p-3 rounded text-sm font-mono focus:outline-none focus:border-accent text-foreground min-h-[80px] relative z-10 resize-y"
          required
        />
        
        {!backText && suggestion && (
          <div className="absolute bottom-2 right-2 text-xs font-mono text-muted bg-background/80 px-2 py-1 rounded">
            Press <kbd className="border border-border rounded px-1">Tab</kbd> to accept
          </div>
        )}
      </div>

      <button 
        type="submit" 
        className="bg-accent text-black px-4 py-2 rounded font-bold font-mono text-sm self-start flex items-center gap-2 hover:opacity-90 transition-opacity"
        onClick={(e) => {
          // If we manually click submit, clear form states after submission.
          // Since it's a Server Action, form submission handles redirect/revalidation, 
          // but we reset states here to be safe if it doesn't redirect.
          setTimeout(() => {
            setFrontText('');
            setBackText('');
            setSuggestion('');
          }, 100);
        }}
      >
        <Plus size={16} /> Add Card
      </button>
    </form>
  );
}

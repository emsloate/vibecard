'use client';

import { useState, useEffect, useRef } from 'react';
import { createCard } from '@/app/actions/card';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';
import { VibeLogger } from '@/utils/VibeLogger';
import { LatexText } from './LatexText';

interface CreateCardFormProps {
  deckId: string;
}

export function CreateCardForm({ deckId }: CreateCardFormProps) {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
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
        } else {
          VibeLogger.error(`Autocomplete UI request failed with status: ${response.status}`);
        }
      } catch (error) {
        VibeLogger.error('Failed to get autocomplete suggestion', error);
      } finally {
        setIsPredicting(false);
      }
    }, 800);

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

  const handleRegenerate = async () => {
    if (!frontText.trim()) return;
    setIsRegenerating(true);

    try {
      const response = await fetch('/api/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          frontText,
          feedback: feedback.trim() || undefined,
          previousBack: backText || suggestion || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBackText(data.text);
        setSuggestion('');
        setFeedback('');
        setShowFeedback(false);
      }
    } catch (error) {
      VibeLogger.error('Failed to regenerate', error);
    } finally {
      setIsRegenerating(false);
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
            <LatexText text={suggestion} />
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
          <div className="absolute bottom-2 right-2 text-xs font-mono text-muted bg-background/80 px-2 py-1 rounded z-20">
            Press <kbd className="border border-border rounded px-1">Tab</kbd> to accept
          </div>
        )}
      </div>

      {/* Preview rendered LaTeX if the back text contains $ */}
      {backText && backText.includes('$') && (
        <div className="bg-card-hover border border-border rounded p-3 text-sm font-mono">
          <div className="text-xs text-muted mb-1 uppercase tracking-wider">Preview</div>
          <LatexText text={backText} />
        </div>
      )}

      {/* Regenerate section */}
      <div className="flex items-center gap-2">
        <button 
          type="button"
          onClick={() => {
            if (showFeedback) {
              handleRegenerate();
            } else if (backText || suggestion) {
              setShowFeedback(true);
            } else {
              handleRegenerate();
            }
          }}
          disabled={isRegenerating || !frontText.trim()}
          className="text-muted hover:text-accent border border-border hover:border-accent/30 px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </button>

        {showFeedback && (
          <div className="flex-1 flex gap-2 items-center animate-fade-in">
            <input
              type="text"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleRegenerate(); } }}
              placeholder="Feedback (e.g. 'shorter', 'include formula', 'more specific')..."
              autoFocus
              className="flex-1 bg-transparent border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => { setShowFeedback(false); setFeedback(''); }}
              className="text-xs font-mono text-muted hover:text-foreground px-1"
            >
              ✕
            </button>
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
            setFeedback('');
            setShowFeedback(false);
          }, 100);
        }}
      >
        <Plus size={16} /> Add Card
      </button>
    </form>
  );
}

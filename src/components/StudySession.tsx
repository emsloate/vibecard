'use client';

import { useState, useEffect, useCallback } from 'react';
import { gradeCard, getDueCards, logSessionComplete } from '@/app/actions/card';
import { RotateCcw, ChevronRight, CheckCircle2, Clock, Brain, Zap, Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LatexText } from './LatexText';

interface Card {
  id: string;
  front_text: string;
  back_text: string;
  ease_factor: number;
  interval: number;
  reps: number;
}

interface StudySessionProps {
  deckId: string;
  deckTitle: string;
  initialCards: Card[];
}

function formatInterval(interval: number, quality: number, card: Card): string {
  if (quality === 0) return '< 1 min';

  let ef = card.ease_factor;
  let reps = card.reps + 1;
  let newInterval: number;

  if (reps === 1) {
    newInterval = 1;
  } else if (reps === 2) {
    newInterval = 6;
  } else {
    const q = quality + 2;
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ef = Math.max(1.3, ef);
    newInterval = Math.round(interval * ef);
  }

  if (quality === 3) {
    newInterval = Math.round(newInterval * 1.3);
  }

  if (newInterval === 1) return '1 day';
  if (newInterval < 30) return `${newInterval} days`;
  if (newInterval < 365) return `${Math.round(newInterval / 30)} mo`;
  return `${(newInterval / 365).toFixed(1)} yr`;
}

const gradeConfig = [
  { quality: 0, label: 'Again', icon: RotateCcw, color: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20', activeColor: 'bg-red-500 text-white' },
  { quality: 1, label: 'Hard', icon: Brain, color: 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20', activeColor: 'bg-orange-500 text-white' },
  { quality: 2, label: 'Good', icon: ChevronRight, color: 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20', activeColor: 'bg-green-500 text-white' },
  { quality: 3, label: 'Easy', icon: Zap, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20', activeColor: 'bg-blue-500 text-white' },
];

export function StudySession({ deckId, deckTitle, initialCards }: StudySessionProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [startTime] = useState(Date.now());
  const [sessionComplete, setSessionComplete] = useState(initialCards.length === 0);

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    if (!isFlipped && !isGrading) {
      setIsFlipped(true);
    }
  }, [isFlipped, isGrading]);

  const handleGrade = async (quality: number) => {
    if (!currentCard || isGrading) return;
    setIsGrading(true);

    try {
      await gradeCard(currentCard.id, quality, deckId);
      setReviewed(prev => prev + 1);

      // If "Again", re-add to the end of the queue
      if (quality === 0) {
        setCards(prev => [...prev, currentCard]);
      }

      if (currentIndex + 1 >= cards.length && quality !== 0) {
        // Check for any new due cards (e.g., "Again" cards that are now due)
        const freshDue = await getDueCards(deckId);
        if (freshDue && freshDue.length > 0) {
          setCards(freshDue);
          setCurrentIndex(0);
        } else {
          // All due cards cleared — log completion for streak tracking
          logSessionComplete(deckId);
          setSessionComplete(true);
        }
      } else {
        setCurrentIndex(prev => prev + 1);
      }

      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to grade card:', error);
    } finally {
      setIsGrading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isFlipped && e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && !isGrading) {
        if (e.key === '1') handleGrade(0);
        else if (e.key === '2') handleGrade(1);
        else if (e.key === '3') handleGrade(2);
        else if (e.key === '4') handleGrade(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isGrading, handleFlip]);

  const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-card border border-border rounded-xl p-10 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={32} className="text-accent" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-accent mb-2">Session Complete!</h2>
          <p className="text-muted font-mono text-sm mb-8">Great work. Your brain thanks you.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card-hover border border-border rounded p-4">
              <div className="text-2xl font-bold font-mono text-foreground">{reviewed}</div>
              <div className="text-xs font-mono text-muted mt-1">Cards Reviewed</div>
            </div>
            <div className="bg-card-hover border border-border rounded p-4">
              <div className="text-2xl font-bold font-mono text-foreground">{elapsedMinutes}m</div>
              <div className="text-xs font-mono text-muted mt-1">Study Time</div>
            </div>
          </div>

          <Link
            href={`/decks/${deckId}`}
            className="inline-flex items-center gap-2 bg-accent text-black px-6 py-3 rounded font-bold font-mono text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} />
            Back to {deckTitle}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8">
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between items-center mb-2">
          <Link href={`/decks/${deckId}`} className="text-muted hover:text-foreground font-mono text-xs flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> {deckTitle}
          </Link>
          <div className="text-xs font-mono text-muted flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock size={12} /> {elapsedMinutes}m</span>
            <span>{currentIndex + 1} / {cards.length}</span>
          </div>
        </div>
        <div className="w-full bg-card-hover border border-border rounded-full h-2 overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl flex-1 flex flex-col min-h-0">
        <div
          onClick={!isFlipped ? handleFlip : undefined}
          className={`flex-1 bg-card border border-border rounded-xl shadow-xl flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-300 ${
            !isFlipped ? 'cursor-pointer hover:border-accent/40 hover:shadow-accent/5' : ''
          }`}
        >
          {/* Front */}
          <div className={`w-full text-center transition-all duration-300 ${isFlipped ? 'mb-6 pb-6 border-b border-border' : ''}`}>
            <div className="text-xs font-mono text-accent uppercase tracking-widest mb-4">Question</div>
            <div className="text-lg sm:text-xl font-mono text-foreground leading-relaxed whitespace-pre-wrap">
              <LatexText text={currentCard?.front_text || ''} />
            </div>
          </div>

          {/* Back (revealed) */}
          {isFlipped && (
            <div className="w-full text-center animate-fade-in">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Answer</div>
              <div className="text-lg sm:text-xl font-mono text-foreground leading-relaxed whitespace-pre-wrap">
                <LatexText text={currentCard?.back_text || ''} />
              </div>
            </div>
          )}

          {/* Tap to reveal hint */}
          {!isFlipped && (
            <div className="mt-8 text-xs font-mono text-muted animate-pulse">
              Click or press Space to reveal answer
            </div>
          )}
        </div>

        {/* Grade buttons */}
        <div className={`mt-6 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="grid grid-cols-4 gap-3">
            {gradeConfig.map(({ quality, label, icon: Icon, color }) => (
              <button
                key={quality}
                onClick={() => handleGrade(quality)}
                disabled={isGrading || !isFlipped}
                className={`border rounded-lg p-3 flex flex-col items-center gap-1.5 font-mono transition-all duration-200 disabled:opacity-50 ${color}`}
              >
                <Icon size={18} />
                <span className="text-xs font-bold">{label}</span>
                <span className="text-[10px] opacity-70">
                  {currentCard && formatInterval(currentCard.interval, quality, currentCard)}
                </span>
                <span className="text-[10px] opacity-40">{quality + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

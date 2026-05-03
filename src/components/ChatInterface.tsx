'use client';

import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Wand2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { VibeLogger } from '@/utils/VibeLogger';

export function ChatInterface() {
  const router = useRouter();
  const { messages, sendMessage, status, error, clearError } = useChat();
  const [input, setInput] = useState('');
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestResult, setHarvestResult] = useState<{ count: number } | null>(null);
  const isLoading = status === 'submitted' || status === 'streaming';

  const getMessageText = (m: any) => {
    if (m.parts) {
      return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    if (m.content) return m.content;
    return '';
  };

  const handleHarvest = async () => {
    if (messages.length === 0) return;
    
    setIsHarvesting(true);
    setHarvestResult(null);
    VibeLogger.info('Triggering manual card harvest from UI');
    const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${getMessageText(m)}`).join('\n');
    
    try {
      const res = await fetch('/api/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (res.ok) {
        const data = await res.json();
        VibeLogger.info('Harvest UI request succeeded');
        setHarvestResult({ count: data.count || 0 });
        // Refresh server components (StagingQueue) to show new cards
        router.refresh();
      } else {
        VibeLogger.error(`Harvest UI request failed with status: ${res.status}`);
      }
    } catch (error) {
      VibeLogger.error('Failed to harvest', error);
    } finally {
      setIsHarvesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    clearError();
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden shadow-xl">
      <div className="p-4 border-b border-border flex justify-between items-center bg-card">
        <div>
          <h2 className="text-sm font-bold font-mono text-accent flex items-center gap-2">
            <Bot size={16} /> Chat Factory
          </h2>
          <p className="text-xs text-muted font-mono mt-1">Explore concepts to generate cards</p>
        </div>
        <div className="flex items-center gap-2">
          {harvestResult && (
            <span className="text-xs font-mono text-green-400 animate-fade-in">
              ✓ {harvestResult.count} cards staged
            </span>
          )}
          <button
            onClick={handleHarvest}
            disabled={messages.length === 0 || isHarvesting || isLoading}
            className="bg-accent text-black px-3 py-1.5 rounded text-xs font-bold font-mono flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Wand2 size={14} />
            {isHarvesting ? 'Harvesting...' : 'Harvest Cards'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3 flex items-start gap-2 text-sm font-mono text-red-400">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Chat Error</p>
              <p className="text-xs mt-1 opacity-80">{error.message || 'An unexpected error occurred. Check your API key configuration.'}</p>
            </div>
          </div>
        )}
        {messages.length === 0 && !error ? (
          <div className="h-full flex items-center justify-center text-center text-muted text-sm font-mono p-8">
            Start chatting about a topic you want to learn. When you are ready, click &quot;Harvest Cards&quot; to automatically extract flashcards to your Staging Queue.
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-accent text-black' : 'bg-card-hover border border-border text-foreground'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] rounded p-3 text-sm font-mono whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-accent/10 border border-accent/20 text-foreground' : 'bg-card-hover border border-border text-foreground'
              }`}>
                {getMessageText(m)}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-accent"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-card-hover border border-border text-foreground px-4 py-2 rounded flex items-center justify-center hover:text-accent transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

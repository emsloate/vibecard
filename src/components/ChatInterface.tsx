'use client';

import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { VibeLogger } from '@/utils/VibeLogger';

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const [isHarvesting, setIsHarvesting] = useState(false);
  const isLoading = status === 'submitted' || status === 'streaming';

  const getMessageText = (m: any) => {
    if (m.content) return m.content;
    if (m.parts) {
      return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return '';
  };

  const handleHarvest = async () => {
    if (messages.length === 0) return;
    
    setIsHarvesting(true);
    VibeLogger.info('Triggering manual card harvest from UI');
    const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${getMessageText(m)}`).join('\n');
    
    try {
      const res = await fetch('/api/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (res.ok) {
        VibeLogger.info('Harvest UI request succeeded');
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
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
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
        <button
          onClick={handleHarvest}
          disabled={messages.length === 0 || isHarvesting || isLoading}
          className="bg-accent text-black px-3 py-1.5 rounded text-xs font-bold font-mono flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Wand2 size={14} />
          {isHarvesting ? 'Harvesting...' : 'Harvest Cards'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted text-sm font-mono p-8">
            Start chatting about a topic you want to learn. When you are ready, click "Harvest Cards" to automatically extract flashcards to your Staging Queue.
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

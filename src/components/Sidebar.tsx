import Link from 'next/link';
import { Home, Layers } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Sidebar() {
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold font-mono text-accent">{"<VibeCard />"}</h1>
        <p className="text-xs text-muted mt-1">Terminal-Density SRS</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        <Link 
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded text-muted hover:text-foreground hover:bg-card-hover transition-colors"
        >
          <Home size={16} />
          <span>Home / Staging</span>
        </Link>
        <Link 
          href="/decks"
          className="flex items-center gap-3 px-3 py-2 rounded text-muted hover:text-foreground hover:bg-card-hover transition-colors"
        >
          <Layers size={16} />
          <span>Decks</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="text-xs text-muted font-mono">
          System: <span className="text-[#10B981]">ONLINE</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

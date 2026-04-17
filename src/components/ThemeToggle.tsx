'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-[104px] bg-border rounded-md animate-pulse"></div>;
  }

  return (
    <div className="flex items-center gap-1 bg-border/50 p-1 rounded-md border border-border">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-sm transition-colors ${theme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
        title="Light Mode"
      >
        <Sun size={14} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-sm transition-colors ${theme === 'system' ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
        title="System Preference"
      >
        <Monitor size={14} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-sm transition-colors ${theme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
        title="Dark Mode"
      >
        <Moon size={14} />
      </button>
    </div>
  );
}

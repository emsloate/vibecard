'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with inline LaTeX ($...$) and display LaTeX ($$...$$).
 * Non-LaTeX text is rendered as-is.
 */
export function LatexText({ text, className = '' }: LatexTextProps) {
  const rendered = useMemo(() => {
    if (!text) return '';

    // Split on LaTeX delimiters: $$...$$ (display) and $...$ (inline)
    // Process display math first ($$), then inline ($)
    const parts: Array<{ type: 'text' | 'latex-inline' | 'latex-display'; content: string }> = [];
    
    // Regex: match $$...$$ or $...$, non-greedy
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Text before this match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }

      const raw = match[1];
      if (raw.startsWith('$$') && raw.endsWith('$$')) {
        parts.push({ type: 'latex-display', content: raw.slice(2, -2) });
      } else {
        parts.push({ type: 'latex-inline', content: raw.slice(1, -1) });
      }

      lastIndex = regex.lastIndex;
    }

    // Remaining text after last match
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  }, [text]);

  if (!rendered || typeof rendered === 'string') {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {rendered.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i}>{part.content}</span>;
        }

        try {
          const html = katex.renderToString(part.content, {
            displayMode: part.type === 'latex-display',
            throwOnError: false,
            trust: true,
          });
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: html }}
              className={part.type === 'latex-display' ? 'block my-2 text-center' : ''}
            />
          );
        } catch {
          // If KaTeX fails, show raw text
          return <span key={i} className="text-red-400">{part.type === 'latex-display' ? `$$${part.content}$$` : `$${part.content}$`}</span>;
        }
      })}
    </span>
  );
}

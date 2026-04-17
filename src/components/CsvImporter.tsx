'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { bulkInsertCards } from '@/app/actions/card';

interface CsvImporterProps {
  deckId: string;
}

export default function CsvImporter({ deckId }: CsvImporterProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const cardsToInsert = results.data.map((row: any) => {
            // Assuming Anki format: FrontText, BackText, [ease_factor], [interval], [reps]
            // We'll take the first two columns as front and back at least.
            const front_text = row[0] || '';
            const back_text = row[1] || '';
            const ease_factor = row[2] ? parseFloat(row[2]) : 2.5;
            const interval = row[3] ? parseInt(row[3], 10) : 0;
            const reps = row[4] ? parseInt(row[4], 10) : 0;

            if (!front_text || !back_text) {
              throw new Error("Invalid CSV format. Expected Front and Back text.");
            }

            return {
              deck_id: deckId,
              front_text,
              back_text,
              ease_factor: isNaN(ease_factor) ? 2.5 : ease_factor,
              interval: isNaN(interval) ? 0 : interval,
              reps: isNaN(reps) ? 0 : reps,
            };
          });

          await bulkInsertCards(cardsToInsert);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err: any) {
          setError(err.message || "Failed to import cards");
        } finally {
          setIsImporting(false);
        }
      },
      error: (err) => {
        setError("Failed to parse CSV file: " + err.message);
        setIsImporting(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-4">
      <input 
        type="file" 
        accept=".csv,.txt"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center gap-2 border border-border text-foreground px-4 py-2 rounded text-sm font-mono hover:bg-card-hover transition-colors disabled:opacity-50"
      >
        <Upload size={16} />
        {isImporting ? 'Importing...' : 'Import CSV'}
      </button>
      {error && <span className="text-red-500 text-xs font-mono">{error}</span>}
    </div>
  );
}

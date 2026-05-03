import { getDeck } from "@/app/actions/deck";
import { getCards, getDueCards, deleteCard } from "@/app/actions/card";
import Link from "next/link";
import { ArrowLeft, Trash2, GraduationCap } from "lucide-react";
import CsvImporter from "@/components/CsvImporter";
import { CreateCardForm } from "@/components/CreateCardForm";
import { LatexText } from "@/components/LatexText";

export const dynamic = 'force-dynamic';

export default async function DeckDetailPage({ params }: { params: { id: string } }) {
  // Fix for Next.js 16 dynamic params
  // Need to await params if it's treated as a promise in some Next.js versions, but here it's fine
  // Wait, in Next 15+ `params` is a promise, so we should await it if we have issues.
  const { id } = await params;

  const [deck, cards, dueCards] = await Promise.all([
    getDeck(id),
    getCards(id),
    getDueCards(id),
  ]);

  const dueCount = dueCards?.length || 0;

  return (
    <div className="p-8 sm:p-12 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/decks" className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-mono text-accent">{deck.title}</h1>
            {deck.description && <p className="text-muted font-mono text-sm mt-1">{deck.description}</p>}
          </div>
        </div>

        <Link
          href={`/decks/${deck.id}/study`}
          className={`flex items-center gap-2 px-5 py-2.5 rounded font-bold font-mono text-sm transition-all duration-200 ${
            dueCount > 0
              ? 'bg-accent text-black hover:opacity-90 shadow-lg shadow-accent/20'
              : 'bg-card-hover border border-border text-muted hover:text-foreground'
          }`}
        >
          <GraduationCap size={18} />
          <span>Study{dueCount > 0 ? ` (${dueCount} due)` : ''}</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
        {/* Manual Creation Form */}
        <div className="flex-1 w-full bg-card border border-border rounded p-6 shadow-xl">
          <h2 className="text-sm font-mono text-muted mb-4 uppercase tracking-wider">Add Card (Manual)</h2>
          <CreateCardForm deckId={deck.id} />
        </div>

        {/* CSV Importer */}
        <div className="w-full md:w-auto bg-card border border-border rounded p-6 shadow-xl">
          <h2 className="text-sm font-mono text-muted mb-4 uppercase tracking-wider">Anki Import</h2>
          <p className="text-xs font-mono text-muted mb-4 max-w-xs">
            Import a tab-separated or CSV file exported from Anki. Expected format: FrontText, BackText, [ease_factor], [interval], [reps].
          </p>
          <CsvImporter deckId={deck.id} />
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 bg-card border border-border rounded overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center text-xs font-mono text-muted uppercase tracking-wider">
          <span>Cards ({cards?.length || 0})</span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border">
            {cards?.length === 0 ? (
              <div className="p-8 text-center text-muted font-mono text-sm">
                No cards in this deck yet.
              </div>
            ) : (
              cards?.map((card) => (
                <div key={card.id} className="p-4 hover:bg-card-hover transition-colors group flex items-start justify-between gap-4">
                  <div className="flex-1 font-mono text-sm flex flex-col gap-2">
                    <div className="text-foreground break-words"><span className="text-accent text-xs mr-2">Q:</span><LatexText text={card.front_text} /></div>
                    <div className="text-muted break-words"><span className="text-muted text-xs mr-2">A:</span><LatexText text={card.back_text} /></div>
                    
                    <div className="flex gap-4 mt-2 text-xs text-muted">
                      <span>EF: {card.ease_factor}</span>
                      <span>Int: {card.interval}d</span>
                      <span>Reps: {card.reps}</span>
                    </div>
                  </div>
                  
                  <form action={async () => {
                    'use server'
                    await deleteCard(card.id, deck.id)
                  }}>
                    <button type="submit" className="text-muted hover:text-red-500 transition-colors p-1" title="Delete Card">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { getDecks, createDeck, deleteDeck } from "@/app/actions/deck";
import Link from "next/link";
import { Plus, Trash2, BookOpen } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <div className="p-8 sm:p-12 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-mono text-accent">Decks</h1>
          <p className="text-muted font-mono text-sm mt-1">Manage your study collections</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded p-6 mb-8 shadow-xl">
        <h2 className="text-sm font-mono text-muted mb-4 uppercase tracking-wider">Create New Deck</h2>
        <form action={createDeck} className="flex gap-4">
          <input 
            type="text" 
            name="title" 
            placeholder="Deck Title (e.g. Linear Algebra)" 
            className="flex-1 bg-transparent border border-border p-2 rounded text-sm font-mono focus:outline-none focus:border-accent text-foreground"
            required
          />
          <input 
            type="text" 
            name="description" 
            placeholder="Description (Optional)" 
            className="flex-1 bg-transparent border border-border p-2 rounded text-sm font-mono focus:outline-none focus:border-accent text-foreground hidden sm:block"
          />
          <button 
            type="submit" 
            className="bg-accent text-black px-4 py-2 rounded font-bold font-mono text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Create
          </button>
        </form>
      </div>

      <div className="flex-1 bg-card border border-border rounded overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-mono text-muted uppercase tracking-wider">
          <div className="col-span-4 sm:col-span-3">Title</div>
          <div className="col-span-6 sm:col-span-6 hidden sm:block">Description</div>
          <div className="col-span-4 sm:col-span-2 text-right">Created</div>
          <div className="col-span-4 sm:col-span-1 text-center">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {decks?.length === 0 ? (
            <div className="p-8 text-center text-muted font-mono text-sm">
              No decks found. Create one above.
            </div>
          ) : (
            decks?.map((deck) => (
              <div key={deck.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-card-hover transition-colors font-mono text-sm group">
                <div className="col-span-4 sm:col-span-3">
                  <Link href={`/decks/${deck.id}`} className="text-foreground hover:text-accent flex items-center gap-2">
                    <BookOpen size={14} className="text-muted group-hover:text-accent" />
                    <span className="truncate">{deck.title}</span>
                  </Link>
                </div>
                <div className="col-span-6 sm:col-span-6 hidden sm:block text-muted truncate">
                  {deck.description || "-"}
                </div>
                <div className="col-span-4 sm:col-span-2 text-right text-muted text-xs">
                  {new Date(deck.created_at).toLocaleDateString()}
                </div>
                <div className="col-span-4 sm:col-span-1 flex justify-center">
                  <form action={async () => {
                    'use server'
                    await deleteDeck(deck.id)
                  }}>
                    <button type="submit" className="text-muted hover:text-red-500 transition-colors p-1" title="Delete Deck">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

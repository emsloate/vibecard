import { getDeck } from "@/app/actions/deck";
import { getDueCards } from "@/app/actions/card";
import { StudySession } from "@/components/StudySession";

export const dynamic = 'force-dynamic';

export default async function StudyPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const [deck, dueCards] = await Promise.all([
    getDeck(id),
    getDueCards(id),
  ]);

  return (
    <div className="h-full flex flex-col">
      <StudySession
        deckId={deck.id}
        deckTitle={deck.title}
        initialCards={dueCards || []}
      />
    </div>
  );
}

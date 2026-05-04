'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { VibeLogger } from '@/utils/VibeLogger'

export async function getCards(deckId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false })

  if (error) {
    VibeLogger.error(`Failed to fetch cards for deck ${deckId}`, error)
    throw new Error('Failed to fetch cards')
  }

  return data
}

export async function getStagedCards() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .is('deck_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    VibeLogger.error('Failed to fetch staged cards', error)
    throw new Error('Failed to fetch staged cards')
  }

  return data
}

export async function createCard(formData: FormData) {
  const deck_id = formData.get('deck_id') as string | null
  const front_text = formData.get('front_text') as string
  const back_text = formData.get('back_text') as string

  if (!front_text || !back_text) {
    throw new Error('Missing required fields')
  }

  // Treat 'null' string as actual null
  const finalDeckId = (deck_id && deck_id !== 'null') ? deck_id : null;

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('cards')
    .insert([{ deck_id: finalDeckId, front_text, back_text }])
    .select()
    .single()

  if (error) {
    VibeLogger.error('Failed to create card', error)
    throw new Error('Failed to create card')
  }

  if (finalDeckId) {
    revalidatePath(`/decks/${finalDeckId}`)
  } else {
    revalidatePath('/')
  }
  return data
}

export async function deleteCard(id: string, deckId?: string | null) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)

  if (error) {
    VibeLogger.error(`Failed to delete card ${id}`, error)
    throw new Error('Failed to delete card')
  }

  if (deckId && deckId !== 'null') {
    revalidatePath(`/decks/${deckId}`)
  } else {
    revalidatePath('/')
  }
}

export async function approveCard(id: string, deckId: string) {
  if (!deckId) throw new Error('Deck ID is required to approve a card');

  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('cards')
    .update({ deck_id: deckId })
    .eq('id', id)

  if (error) {
    VibeLogger.error(`Failed to approve card ${id}`, error)
    throw new Error('Failed to approve card')
  }

  revalidatePath('/')
  revalidatePath(`/decks/${deckId}`)
}

export async function bulkInsertCards(cards: Array<{
  deck_id?: string | null;
  front_text: string;
  back_text: string;
  ease_factor?: number;
  interval?: number;
  reps?: number;
}>) {
  const supabase = createServerSupabaseClient()
  
  const mappedCards = cards.map(c => ({
    ...c,
    deck_id: c.deck_id === 'null' ? null : c.deck_id
  }));

  const { data, error } = await supabase
    .from('cards')
    .insert(mappedCards)
    .select()

  if (error) {
    VibeLogger.error('Failed to bulk insert cards', error)
    throw new Error('Failed to bulk insert cards')
  }

  // Revalidate appropriately
  const hasStaged = mappedCards.some(c => !c.deck_id);
  if (hasStaged) revalidatePath('/');
  
  const validDeckIds = [...new Set(mappedCards.map(c => c.deck_id).filter(Boolean))];
  validDeckIds.forEach(id => revalidatePath(`/decks/${id}`));
  
  return data
}

export async function getDueCards(deckId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .lte('next_review', new Date().toISOString())
    .order('next_review', { ascending: true })

  if (error) {
    VibeLogger.error(`Failed to fetch due cards for deck ${deckId}`, error)
    throw new Error('Failed to fetch due cards')
  }

  return data
}

/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * Quality ratings:
 *   0 = Again (complete failure, reset)
 *   1 = Hard  (correct but with significant difficulty)
 *   2 = Good  (correct with some effort)
 *   3 = Easy  (effortless recall)
 */
export async function gradeCard(cardId: string, quality: number, deckId: string) {
  if (quality < 0 || quality > 3) throw new Error('Quality must be 0-3');

  const supabase = createServerSupabaseClient()

  // Fetch current card state
  const { data: card, error: fetchError } = await supabase
    .from('cards')
    .select('ease_factor, interval, reps')
    .eq('id', cardId)
    .single()

  if (fetchError || !card) {
    VibeLogger.error(`Failed to fetch card ${cardId} for grading`, fetchError)
    throw new Error('Failed to fetch card for grading')
  }

  let { ease_factor, interval, reps } = card;

  if (quality === 0) {
    // Again: reset progress
    reps = 0;
    interval = 0;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  } else {
    // Correct answer — advance through SM-2 intervals
    reps += 1;

    if (reps === 1) {
      interval = 1;
    } else if (reps === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }

    // Adjust ease factor based on quality (mapped from 0-3 to SM-2's 0-5 scale)
    // quality 1 (Hard) -> SM-2 q=3, quality 2 (Good) -> SM-2 q=4, quality 3 (Easy) -> SM-2 q=5
    const q = quality + 2; // map to SM-2 scale (3, 4, 5)
    ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ease_factor = Math.max(1.3, ease_factor);

    // Easy bonus: multiply interval by 1.3 for effortless recall
    if (quality === 3) {
      interval = Math.round(interval * 1.3);
    }
  }

  // Calculate next review date
  const next_review = new Date();
  if (interval === 0) {
    // "Again" — card is immediately due so it shows up on re-entry
    // (within the session, the client re-adds it to the local queue)
  } else {
    next_review.setDate(next_review.getDate() + interval);
  }

  const { error: updateError } = await supabase
    .from('cards')
    .update({
      ease_factor: parseFloat(ease_factor.toFixed(2)),
      interval,
      reps,
      next_review: next_review.toISOString(),
    })
    .eq('id', cardId)

  if (updateError) {
    VibeLogger.error(`Failed to grade card ${cardId}`, updateError)
    throw new Error('Failed to grade card')
  }

  // Log the review event for stats tracking
  await supabase
    .from('reviews')
    .insert({ card_id: cardId, deck_id: deckId, quality })
    .then(({ error: reviewError }) => {
      if (reviewError) VibeLogger.error('Failed to log review', reviewError);
    });

  revalidatePath(`/decks/${deckId}`)
  return { ease_factor, interval, reps, next_review: next_review.toISOString() }
}

/**
 * Log that a user cleared all due cards for a deck.
 * Used for streak calculation.
 */
export async function logSessionComplete(deckId: string) {
  const supabase = createServerSupabaseClient()

  // Avoid duplicate completions for the same deck on the same day
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('completions')
    .select('id')
    .eq('deck_id', deckId)
    .eq('completed_at', today)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase
      .from('completions')
      .insert({ deck_id: deckId, completed_at: today })

    if (error) {
      VibeLogger.error('Failed to log session completion', error);
    }
  }
}


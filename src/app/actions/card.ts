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

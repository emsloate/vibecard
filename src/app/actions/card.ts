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

export async function createCard(formData: FormData) {
  const deck_id = formData.get('deck_id') as string
  const front_text = formData.get('front_text') as string
  const back_text = formData.get('back_text') as string

  if (!deck_id || !front_text || !back_text) {
    throw new Error('Missing required fields')
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('cards')
    .insert([{ deck_id, front_text, back_text }])
    .select()
    .single()

  if (error) {
    VibeLogger.error('Failed to create card', error)
    throw new Error('Failed to create card')
  }

  revalidatePath(`/decks/${deck_id}`)
  return data
}

export async function deleteCard(id: string, deckId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)

  if (error) {
    VibeLogger.error(`Failed to delete card ${id}`, error)
    throw new Error('Failed to delete card')
  }

  revalidatePath(`/decks/${deckId}`)
}

export async function bulkInsertCards(cards: Array<{
  deck_id: string;
  front_text: string;
  back_text: string;
  ease_factor?: number;
  interval?: number;
  reps?: number;
}>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('cards')
    .insert(cards)
    .select()

  if (error) {
    VibeLogger.error('Failed to bulk insert cards', error)
    throw new Error('Failed to bulk insert cards')
  }

  if (cards.length > 0) {
    revalidatePath(`/decks/${cards[0].deck_id}`)
  }
  
  return data
}

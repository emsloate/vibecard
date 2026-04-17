'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { VibeLogger } from '@/utils/VibeLogger'

export async function getDecks() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    VibeLogger.error('Failed to fetch decks', error)
    throw new Error('Failed to fetch decks')
  }

  return data
}

export async function getDeck(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    VibeLogger.error(`Failed to fetch deck ${id}`, error)
    throw new Error('Failed to fetch deck')
  }

  return data
}

export async function createDeck(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title) {
    throw new Error('Title is required')
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('decks')
    .insert([{ title, description }])
    .select()
    .single()

  if (error) {
    VibeLogger.error('Failed to create deck', error)
    throw new Error('Failed to create deck')
  }

  revalidatePath('/decks')
  return data
}

export async function deleteDeck(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', id)

  if (error) {
    VibeLogger.error(`Failed to delete deck ${id}`, error)
    throw new Error('Failed to delete deck')
  }

  revalidatePath('/decks')
}

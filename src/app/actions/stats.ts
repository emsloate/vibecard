'use server'

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { VibeLogger } from '@/utils/VibeLogger'

/**
 * Get daily review counts for the past N days.
 * Powers the activity heatmap.
 */
export async function getReviewHistory(days: number = 105) {
  const supabase = createServerSupabaseClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('reviews')
    .select('quality, reviewed_at')
    .gte('reviewed_at', since.toISOString())
    .order('reviewed_at', { ascending: true })

  if (error) {
    VibeLogger.error('Failed to fetch review history', error)
    return []
  }

  // Group by date
  const dailyMap = new Map<string, { count: number; again: number; good: number }>()
  
  for (const review of data || []) {
    const date = new Date(review.reviewed_at).toISOString().split('T')[0]
    const entry = dailyMap.get(date) || { count: 0, again: 0, good: 0 }
    entry.count += 1
    if (review.quality === 0) entry.again += 1
    else entry.good += 1
    dailyMap.set(date, entry)
  }

  // Fill in all dates in the range
  const result = []
  const current = new Date(since)
  const today = new Date()
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0]
    const entry = dailyMap.get(dateStr) || { count: 0, again: 0, good: 0 }
    result.push({ date: dateStr, ...entry })
    current.setDate(current.getDate() + 1)
  }

  return result
}

/**
 * Get streak info based on completions.
 * A "streak day" = user cleared all due cards for ≥1 deck.
 */
export async function getStreakInfo() {
  const supabase = createServerSupabaseClient()

  // Get all completion dates, newest first
  const { data, error } = await supabase
    .from('completions')
    .select('completed_at')
    .order('completed_at', { ascending: false })

  if (error) {
    VibeLogger.error('Failed to fetch streak info', error)
    return { current: 0, longest: 0, todayCleared: false }
  }

  if (!data || data.length === 0) {
    return { current: 0, longest: 0, todayCleared: false }
  }

  // Deduplicate dates
  const uniqueDates = [...new Set(data.map(d => d.completed_at))].sort().reverse()
  
  const today = new Date().toISOString().split('T')[0]
  const todayCleared = uniqueDates[0] === today

  // Calculate current streak (consecutive days ending today or yesterday)
  let currentStreak = 0
  const startCheck = new Date()
  // If no completion today, check if yesterday had one (streak not broken until end of day)
  if (!todayCleared) {
    startCheck.setDate(startCheck.getDate() - 1)
  }

  const dateSet = new Set(uniqueDates)
  const check = new Date(startCheck)
  while (dateSet.has(check.toISOString().split('T')[0])) {
    currentStreak++
    check.setDate(check.getDate() - 1)
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const curr = new Date(uniqueDates[i])
    const next = new Date(uniqueDates[i + 1])
    const diffDays = Math.round((curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { current: currentStreak, longest: longestStreak, todayCleared }
}

/**
 * Get count of cards due in various time buckets.
 */
export async function getDueCardForecast() {
  const supabase = createServerSupabaseClient()
  
  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)
  
  const endOfTomorrow = new Date(endOfToday)
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
  
  const endOfWeek = new Date(endOfToday)
  endOfWeek.setDate(endOfWeek.getDate() + 7)
  
  const endOfMonth = new Date(endOfToday)
  endOfMonth.setDate(endOfMonth.getDate() + 30)

  // Get all cards with their next_review dates (only those assigned to decks)
  const { data: cards, error } = await supabase
    .from('cards')
    .select('next_review')
    .not('deck_id', 'is', null)

  if (error) {
    VibeLogger.error('Failed to fetch due forecast', error)
    return []
  }

  let today = 0, tomorrow = 0, thisWeek = 0, thisMonth = 0, later = 0

  for (const card of cards || []) {
    const nr = new Date(card.next_review)
    if (nr <= endOfToday) today++
    else if (nr <= endOfTomorrow) tomorrow++
    else if (nr <= endOfWeek) thisWeek++
    else if (nr <= endOfMonth) thisMonth++
    else later++
  }

  return [
    { label: 'Today', count: today, color: 'accent' },
    { label: 'Tomorrow', count: tomorrow, color: 'orange' },
    { label: 'This Week', count: thisWeek, color: 'blue' },
    { label: 'This Month', count: thisMonth, color: 'muted' },
    { label: 'Later', count: later, color: 'muted' },
  ]
}

/**
 * Get per-deck progress breakdown.
 * New: reps=0 | Learning: reps 1-3 & interval < 21 | Mastered: reps > 3 OR interval >= 21
 */
export async function getDeckProgress() {
  const supabase = createServerSupabaseClient()

  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('id, title')
    .order('created_at', { ascending: false })

  if (decksError) {
    VibeLogger.error('Failed to fetch decks for progress', decksError)
    return []
  }

  const results = []

  for (const deck of decks || []) {
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('reps, interval')
      .eq('deck_id', deck.id)

    if (cardsError) {
      VibeLogger.error(`Failed to fetch cards for deck ${deck.id}`, cardsError)
      continue
    }

    let newCount = 0, learning = 0, mastered = 0
    for (const card of cards || []) {
      if (card.reps === 0) newCount++
      else if (card.reps > 3 || card.interval >= 21) mastered++
      else learning++
    }

    results.push({
      deck_id: deck.id,
      title: deck.title,
      total: (cards || []).length,
      newCount,
      learning,
      mastered,
    })
  }

  return results
}

/**
 * Get today's review count.
 */
export async function getTodayReviewCount() {
  const supabase = createServerSupabaseClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('reviewed_at', today.toISOString())

  if (error) {
    VibeLogger.error('Failed to fetch today review count', error)
    return 0
  }

  return count || 0
}

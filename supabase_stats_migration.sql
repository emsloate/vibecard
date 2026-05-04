-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Reviews table: logs every individual card grading event
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,
  quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 3),
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_reviewed_at ON reviews(reviewed_at);
CREATE INDEX idx_reviews_deck_id ON reviews(deck_id);

-- 2. Completions table: logs when a user clears all due cards for a deck
CREATE TABLE completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  completed_at DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_completions_completed_at ON completions(completed_at);

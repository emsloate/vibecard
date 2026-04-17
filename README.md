# VibeCard

VibeCard is a zero-friction, AI-native Spaced Repetition System (SRS) platform built to make card creation fast, intelligent, and seamless.

## Features

- **High-Density, Dual-Theme UI:** A semantic variable-driven styling system featuring a "Terminal-Density" Dark mode and a high-contrast "Paper" Light mode for maximum focus.
- **AI "Ghost Text" Autocomplete:** Write the front of a flashcard, and VibeCard's AI automatically predicts the back. Accept suggestions instantly with the `Tab` key.
- **Chat-to-Card Factory:** A conversational AI interface designed for learning. Explore a topic, click "Harvest Cards", and the LLM automatically extracts atomic flashcards from the conversation transcript.
- **Staging Area Queue:** Harvested cards are sent to an Inbox-style staging queue where you can review, edit, or approve them into specific decks.
- **CSV & Anki Import:** Bulk import existing flashcards with full SM-2 algorithm column support (Ease, Interval, Reps).

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL) with Row Level Security and Server Actions
- **AI Integration:** Vercel AI SDK (`ai` and `@ai-sdk/react`)
- **LLM Provider:** Google Generative AI (Gemini 2.5 Flash / Pro)
- **Styling:** Tailwind CSS (v4) & `next-themes`

## Getting Started

### Prerequisites

You will need a Supabase project and a Google Gemini API Key.

1. **Supabase:** Execute the SQL script located in `supabase/schema.sql` on your Supabase project to create the `decks` and `cards` tables.
2. **Environment Variables:** Create a `.env.local` file at the root of the project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Running Locally

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Create a Deck:** Navigate to the sidebar and click "+ New Deck" to organize your cards.
2. **Chat & Harvest:** Use the Home dashboard to chat with the AI. Click "Harvest Cards" to automatically pull flashcards from the chat and place them in the Staging Area.
3. **Approve Cards:** Review cards in the Staging Area, select their destination deck, and click "Approve".
4. **Manual Creation:** Go to a Deck and use the Create Card form. The AI will provide "Ghost Text" predictions for the back of the card as you type the front. Press `Tab` to accept the prediction.

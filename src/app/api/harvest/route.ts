import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { bulkInsertCards } from '@/app/actions/card';
import { VibeLogger } from '@/utils/VibeLogger';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return new Response('Missing transcript', { status: 400 });
    }

    VibeLogger.info('Starting card harvest from chat transcript');

    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: z.object({
        cards: z.array(z.object({
          front_text: z.string().describe("The front side question or prompt of the flashcard"),
          back_text: z.string().describe("The back side answer of the flashcard")
        }))
      }),
      prompt: `Extract high-quality spaced repetition flashcards from the following conversation transcript. Break down complex ideas into concise, atomic flashcards. 
      
Transcript:
${transcript}`
    });

    if (object.cards.length > 0) {
      // Insert into staging (null deck_id)
      const cardsToInsert = object.cards.map(c => ({
        deck_id: null,
        front_text: c.front_text,
        back_text: c.back_text
      }));
      await bulkInsertCards(cardsToInsert);
      VibeLogger.info(`Successfully harvested ${object.cards.length} cards into Staging`);
    } else {
      VibeLogger.info('Harvest completed but no cards were extracted');
    }

    return Response.json({ success: true, count: object.cards.length });
  } catch (error) {
    VibeLogger.error('Harvest Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

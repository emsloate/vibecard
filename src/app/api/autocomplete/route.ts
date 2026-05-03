import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { VibeLogger } from '@/utils/VibeLogger';

const SYSTEM_PROMPT = `You are a flashcard back-side generator. Given the front (question/prompt), produce the shortest correct answer possible. Rules:
- Maximum 1-2 sentences. Aim for under 20 words.
- No bullet points, no lists, no elaboration.
- Give the core fact only — like a dictionary definition or a single key equation.
- If the question involves a formula, equation, or mathematical concept, use LaTeX notation (e.g. $E = mc^2$ or $\\frac{d}{dx}$).
- Output ONLY the back text with zero formatting or conversational filler.`;

export async function POST(req: Request) {
  try {
    const { frontText, feedback, previousBack } = await req.json();

    if (!frontText) {
      return new Response('Missing front text', { status: 400 });
    }

    let prompt = `Front: ${frontText}`;

    // If regenerating with feedback, include the previous attempt and user guidance
    if (feedback && previousBack) {
      prompt = `Front: ${frontText}\n\nPrevious answer: ${previousBack}\nUser feedback: ${feedback}\n\nGenerate an improved back side incorporating the feedback.`;
    }

    const { text } = await generateText({
      model: google('gemini-2.0-flash-lite'),
      system: SYSTEM_PROMPT,
      prompt,
    });

    VibeLogger.info(`Generated autocomplete for: "${frontText.substring(0, 20)}..."`);
    return Response.json({ text });
  } catch (error) {
    VibeLogger.error('Autocomplete Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

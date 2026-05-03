import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { VibeLogger } from '@/utils/VibeLogger';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      VibeLogger.error('GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await req.json();

    VibeLogger.info(`Processing chat request with ${messages.length} messages`);

    // Convert UIMessages (from useChat) to ModelMessages (for streamText)
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: `You are an expert tutor and Spaced Repetition assistant. Your job is to help the user explore concepts, test their knowledge, and prepare material that can easily be extracted into flashcards. Be concise, clear, and structure your explanations logically. When discussing formulas, equations, or mathematical expressions, always use LaTeX notation with $ delimiters (e.g. $E = mc^2$, $\\int_0^1 f(x)\\,dx$).`,
      messages: modelMessages,
    });

    // useChat v3 default transport expects UIMessageStream format (SSE)
    return result.toUIMessageStreamResponse();
  } catch (error) {
    VibeLogger.error('Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your chat request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { VibeLogger } from '@/utils/VibeLogger';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    VibeLogger.info(`Processing chat request with ${messages.length} messages`);

    // Map UIMessages to CoreMessages since streamText expects 'content', not 'parts'
    const coreMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.parts ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : (m.content || ''),
    }));

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: `You are an expert tutor and Spaced Repetition assistant. Your job is to help the user explore concepts, test their knowledge, and prepare material that can easily be extracted into flashcards. Be concise, clear, and structure your explanations logically.`,
      messages: coreMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    VibeLogger.error('Chat Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { frontText } = await req.json();

    if (!frontText) {
      return new Response('Missing front text', { status: 400 });
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'), // You can change this to your preferred model
      system: `You are an expert Spaced Repetition card creator. The user provides a front prompt. Generate a concise, accurate back for the card. Output ONLY the back text, without any additional formatting or conversational text.`,
      prompt: `Front: ${frontText}`,
    });

    return Response.json({ text });
  } catch (error) {
    console.error('Autocomplete Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

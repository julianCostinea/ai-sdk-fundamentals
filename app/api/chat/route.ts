import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const stream = await streamText({
    model: google('gemini-1.5-flash'),
    system: "You are a helpful assistant.",
    messages,
  });
  return stream.toDataStreamResponse();
}

"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { log } from "node:console";

export const generateTextAction = async () => {
  const result = await generateText({
    model: google("gemini-1.5-flash"),
    temperature: 1,
    prompt: "Tell me a joke that's not about atoms.",
  });
  console.log('result', result);
  
  return result.text;
};

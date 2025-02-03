import { openai } from "@ai-sdk/openai";
import {google} from "@ai-sdk/google";
import { generateText, LanguageModel } from "ai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const result = await generateText({
    model: google('gemini-1.5-flash'),
    prompt: "Tell me a joke.",
  });

  console.log(result.text);
}

main().catch(console.error);

"use server";

import { LanguageModel, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";

export const streamTextAction = async () => {
  const result = await streamText({
    model: openai("gpt-3.5-turbo") as LanguageModel,
    temperature: 0.5,
    prompt: "Tell me a joke.",
  });
  return createStreamableValue(result.textStream).value;
};

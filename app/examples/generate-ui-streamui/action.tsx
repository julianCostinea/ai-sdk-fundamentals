"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { JokeComponent } from "./joke-component";
import { generateObject } from "ai";
import { jokeSchema } from "./joke";
import { google } from "@ai-sdk/google";

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const result = await streamUI({
    model: google('gemini-1.5-flash'),
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      tellAJoke: {
        description: "Tell a joke",
        parameters: z.object({
          location: z.string().describe("the users location"),
          age: z.number().optional().describe("the users age"),
        }),
        generate: async function* ({ location, age }) {
          yield <div>loading...</div>;
          const joke = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: jokeSchema,
            prompt:
              "Generate a joke that incorporates the following location:" +
              location + 'and also incorporates their ' + age,
          });
          return <JokeComponent joke={joke.object} />;
        },
      },
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

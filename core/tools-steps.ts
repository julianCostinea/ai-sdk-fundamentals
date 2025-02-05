import { google } from "@ai-sdk/google";
import { generateText, streamText, tool } from "ai";
import { z } from "zod";
import dotenv from "dotenv";
import { Pokemon } from "./analyze-pdf";

dotenv.config();

async function main() {
  const getPokemonInfo = tool({
    description: "Get the height and weight of a Pokemon",
    parameters: z.object({
      pokemonId: z.string().describe("The ID of the Pokemon to get the height and weight for"),
    }),
    execute: async ({ pokemonId }) => {
      const pokemon = (await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then((res) =>
        res.json()
      )) as Pokemon;
      return `${pokemon.name}'s height is ${pokemon.height} and weight is ${pokemon.weight}.`;
    },
  });

  const askAQuestion = async (prompt: string) => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt,
      tools: {
        getPokemonInfo: getPokemonInfo,
      },
      maxSteps: 10,
    });

    for await (const text of textStream) {
      process.stdout.write(text);
    }
  };

  await askAQuestion(`What's the heigh and weight of pokemon with id 1?`);
}
main().catch(console.error);

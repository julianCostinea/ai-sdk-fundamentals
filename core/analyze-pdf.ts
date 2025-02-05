import { google } from "@ai-sdk/google";
import { generateObject, generateText, tool } from "ai";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { z } from "zod";
import path from "path";

dotenv.config();
const schema = z.object({
  invoiceArray: z
    .array(
      z
        .object({
          total: z.number().describe("The total amount of the invoice."),
          currency: z.string().describe("The currency of the total amount."),
          invoiceNumber: z.string().describe("The invoice number."),
          companyAddress: z.string().describe("The address of the company or person issuing the invoice."),
          companyName: z.string().describe("The name of the company issuing the invoice."),
          invoiceeAddress: z.string().describe("The address of the company or person receiving the invoice."),
          salesTax: z.number().describe("The amount of sales tax in the invoice. Usually either GST or VAT."),
        })
        .describe("The extracted data from the invoice.")
    )
    .describe("A list of extracted data from the invoices."),
  invoiceCount: z.number().describe("The number of invoices extracted."),
  allInvoiceTotal: z.number().describe("The total amount of all invoices."),
  salesTaxTotal: z.number().describe("The total amount of sales tax in all invoices. Usually either GST or VAT."),
});

const getWeatherTool = tool({
  description: "Get the current weather in the specified city",
  parameters: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
  execute: async ({ city }) => {
    return `The weather in ${city} is 25°C and sunny.`;
  },
});

async function main(invoicePaths: string[]) {
  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    system:
      `You will receive multiple invoices. ` +
      `Please extract the data from each invoice according to the schema.` +
      `Make sure to include both GST and VAT in the total sales tax.`,
    schema: schema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please extract the data from each of these invoices according to the schema.",
          },
          {
            type: "file",
            data: readFileSync(invoicePaths[0]),
            mimeType: "application/pdf",
          },
          {
            type: "file",
            data: readFileSync(invoicePaths[1]),
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    // tools: {
    //   getWeather: getWeatherTool,
    // },
  });

  const floorTotalSalesTax = Math.floor(object.salesTaxTotal);
  //get pokemon for floorTotalSalesTax from the pokemon api
  const pokemon = (await fetch(`https://pokeapi.co/api/v2/pokemon/${floorTotalSalesTax}`).then((res) =>
    res.json()
  )) as Pokemon;

  console.log("pokemon", pokemon.name);
}

const invoicePath1 = path.join(__dirname, "invoice-1.pdf");
const invoicePath2 = path.join(__dirname, "invoice-2.pdf");

main([invoicePath1, invoicePath2]).catch(console.error);

export type Pokemon = {
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
};

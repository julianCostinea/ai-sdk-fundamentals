"use server";

import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { log } from "node:console";
import { readFileSync } from "node:fs";
import dotenv from "dotenv";
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

export const generatePdfAnalysis = async (fileNames: string[]) => {
  console.log("fileNames", fileNames);

  const inputInvoices: InputInvoice[] = fileNames.map((fileName) => {
    //files are in public/assets
    const filePath = path.join(process.cwd(), "public/assets/" + fileName);
    return {
      type: "file",
      data: readFileSync(filePath),
      mimeType: "application/pdf",
    };
  });

  const messageContent: Array<
    | {
        type: "text";
        text: string;
      }
    | {
        type: string;
        data: Buffer<ArrayBufferLike>;
        mimeType: string;
      }
  > = [
    {
      type: "text",
      text: "Please extract the data from each of these invoices according to the schema.",
    },
    ...inputInvoices,
  ];

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    system:
      `You will receive at least two invoices. ` +
      `Please extract the data from each invoice according to the schema.` +
      `Make sure to include both GST and VAT in the total sales tax.`,
    schema: schema,
    messages: [
      {
        role: "user",
        content: messageContent as any,
      },
    ],
    // tools: {
    //   getWeather: getWeatherTool,
    // },
  });

  return object;
};

type InputInvoice = {
  type: string;
  data: Buffer;
  mimeType: string;
};

//generate from schema
export type Invoice = z.infer<typeof schema>["invoiceArray"][0];

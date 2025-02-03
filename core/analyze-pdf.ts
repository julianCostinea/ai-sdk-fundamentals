import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
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
        })
        .describe("The extracted data from the invoice.")
    )
    .describe("A list of extracted data from the invoices."),
  invoiceCount: z.number().describe("The number of invoices extracted."),
  allInvoiceTotal: z.number().describe("The total amount of all invoices."),
});

async function main(invoicePaths: string[]) {
  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    system: `You will receive multiple invoices. ` + `Please extract the data from each invoice.`,
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
  });

  console.log(object);
}

const invoicePath1 = path.join(__dirname, "invoice-1.pdf");
const invoicePath2 = path.join(__dirname, "invoice-2.pdf");

main([invoicePath1, invoicePath2]).catch(console.error);

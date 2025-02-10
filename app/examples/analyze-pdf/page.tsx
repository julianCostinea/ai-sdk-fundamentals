"use client";

import { useMemo, useState } from "react";
import { generatePdfAnalysis, Invoice } from "./action";
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table";

export default function Page() {
  const [files, setFiles] = useState<FileList>();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PdfAnalysisResponse>();
  const [data, setData] = useState<Invoice[]>([]);
  const columns = useMemo<MRT_ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoiceNumber", //access nested data with dot notation
        header: "Invoice No ",
        size: 150,
      },
      {
        accessorKey: "companyName",
        header: "Company Name",
        size: 150,
      },
      {
        accessorKey: "companyAddress",
        header: "Company Address",
        size: 150,
      },
      {
        accessorKey: "currency",
        header: "Currency",
        size: 150,
      },
      {
        accessorKey: "total",
        header: "Total",
        size: 150,
      },
      {
        accessorKey: "salesTax",
        header: "Sales Tax",
        size: 150,
      },
    ],
    []
  );
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(event.target.files);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files) return;
    setLoading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    // Example of how you might handle the file upload
    // Replace with your actual file upload logic
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      response.json().then((data) => {
        const { Message, status, fileNames } = data;
        generatePdfAnalysis(fileNames).then((analysis) => {
          const pdfAnalysis = analysis as PdfAnalysisResponse;
          setAnalysis(pdfAnalysis);
          setData(pdfAnalysis.invoiceArray);
          setLoading(false);
        });
      });
    } else {
      console.error("File upload failed");
      setLoading(false);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Upload a file to receive analysis</h1>
      {loading && <p>Loading...</p>}
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} multiple />
        <button type="submit">Upload</button>
      </form>
      {analysis && (
        <div>
          <h2 className="text-lg font-semibold">Analysis</h2>
          <p>Total Invoice Count: {analysis.invoiceCount}</p>
          <p>Total Sales Tax: {analysis.salesTaxTotal}</p>
          <p>Total Invoice Total: {analysis.allInvoiceTotal}</p>
          <h3 className="text-lg font-semibold">Invoices</h3>
          {/* <ul>
            {analysis.invoiceArray.map((invoice: Invoice, index: number) => (
              <li key={index}>
                <p>Invoice {index + 1}</p>
                <p>Invoice Total: {invoice.total}</p>
                <p>Sales Tax: {invoice.salesTax}</p>
              </li>
            ))}
          </ul> */}
          <MaterialReactTable table={table} />
        </div>
      )}
    </div>
  );
}

export type UploadFileResponse = {
  Message: string;
  status: number;
  fileNames: string[];
};

export type PdfAnalysisResponse = {
  allInvoiceTotal: number;
  salesTaxTotal: number;
  invoiceCount: number;
  invoiceArray: Array<Invoice>;
};

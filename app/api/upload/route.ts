import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
export const POST = async (req: Request, res: Response) => {
  const formData = await req.formData();
  const files = formData.getAll("file");

  if (files.length === 0) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  try {
    const fileNames = [];
    for (const file of files) {
      const buffer = Buffer.from(await (file as File).arrayBuffer());
      const filename = (file as File).name.replaceAll(" ", "_");
      fileNames.push(filename);
      await writeFile(path.join(process.cwd(), "public/assets/" + filename), buffer);
    }
    return NextResponse.json({ Message: "Success", status: 201, fileNames });
  } catch (error) {
    console.log("Error occurred ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};

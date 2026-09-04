import { PDFParse } from "pdf-parse"

// Dev-only PDF text extraction (W-46 follow-up). pdf-parse is a
// devDependency, not a runtime one - adapters run as an offline/CLI
// extraction pass, not inside the deployed Worker, so this never ships
// in the production bundle.
export async function fetchPdfText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  return result.text
}

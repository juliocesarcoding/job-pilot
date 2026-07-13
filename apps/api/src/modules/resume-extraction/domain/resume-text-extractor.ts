import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export type ResumeExtractionFormat = '.pdf' | '.docx';

export interface RawResumeExtractionResult {
  text: string;
  pageCount: number | null;
  parser: string;
  warnings: string[];
}

interface MammothMessage {
  message: string;
}

export async function extractRawResumeText(
  format: ResumeExtractionFormat,
  buffer: Buffer,
): Promise<RawResumeExtractionResult> {
  switch (format) {
    case '.pdf':
      return extractPdfText(buffer);
    case '.docx':
      return extractDocxText(buffer);
  }
}

async function extractPdfText(buffer: Buffer): Promise<RawResumeExtractionResult> {
  const parsed = await pdfParse(buffer);

  return {
    text: normalizeExtractedText(parsed.text),
    pageCount: parsed.numpages,
    parser: 'pdf-parse',
    warnings: [],
  };
}

async function extractDocxText(buffer: Buffer): Promise<RawResumeExtractionResult> {
  const result = await mammoth.extractRawText({ buffer });

  return {
    text: normalizeExtractedText(result.value),
    pageCount: null,
    parser: 'mammoth',
    warnings: result.messages.map((message: MammothMessage) => message.message),
  };
}

function normalizeExtractedText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { extractRawResumeText } from './resume-text-extractor';

vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}));

vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(),
  },
}));

describe('extractRawResumeText', () => {
  beforeEach(() => {
    vi.mocked(pdfParse).mockReset();
    vi.mocked(mammoth.extractRawText).mockReset();
  });

  it('extracts PDF text and page count using pdf-parse', async () => {
    vi.mocked(pdfParse).mockResolvedValue({
      text: 'Senior engineer\n\nwith systems experience',
      numpages: 2,
      numrender: 2,
      info: {},
      metadata: null,
      version: 'v1.10.100',
    });

    await expect(extractRawResumeText('.pdf', Buffer.from('pdf'))).resolves.toEqual({
      text: 'Senior engineer\n\nwith systems experience',
      pageCount: 2,
      parser: 'pdf-parse',
      warnings: [],
    });
  });

  it('extracts DOCX raw text using mammoth', async () => {
    vi.mocked(mammoth.extractRawText).mockResolvedValue({
      value: 'Developer with TypeScript experience\n',
      messages: [{ type: 'warning', message: 'Skipped unsupported element' }],
    });

    await expect(extractRawResumeText('.docx', Buffer.from('docx'))).resolves.toEqual({
      text: 'Developer with TypeScript experience',
      pageCount: null,
      parser: 'mammoth',
      warnings: ['Skipped unsupported element'],
    });
  });
});

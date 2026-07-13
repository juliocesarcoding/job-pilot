import {
  RESUME_ANALYSIS_PROMPT_VERSION,
  buildResumeAnalysisSystemPrompt,
} from '@job-pilot/ai';
import { Injectable } from '@nestjs/common';
import { loadApiEnv } from '../../../config/env';
import {
  ResumeAnalysisProvider,
  ResumeAnalysisProviderInput,
  ResumeAnalysisProviderResult,
} from './resume-analysis.provider';

interface OpenAIUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

interface OpenAIResponseBody {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: OpenAIUsage;
  error?: {
    code?: string;
    message?: string;
  };
}

export class OpenAIResumeAnalysisProviderError extends Error {
  constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class OpenAIResumeAnalysisProvider implements ResumeAnalysisProvider {
  async analyze(input: ResumeAnalysisProviderInput): Promise<ResumeAnalysisProviderResult> {
    const env = loadApiEnv(process.env);
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        input: [
          {
            role: 'system',
            content: buildResumeAnalysisSystemPrompt(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              extractedText: input.extractedText,
              language: input.language,
              metadata: input.metadata,
              promptVersion: RESUME_ANALYSIS_PROMPT_VERSION,
            }),
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'resume_analysis',
            strict: true,
            schema: resumeAnalysisJsonSchema,
          },
        },
      }),
    });

    const body = (await response.json()) as OpenAIResponseBody;

    if (!response.ok) {
      throw new OpenAIResumeAnalysisProviderError(formatOpenAIError(response.status, body));
    }

    const outputText = extractOutputText(body);

    return {
      provider: 'openai',
      model: env.OPENAI_MODEL ?? '',
      analysis: parseJsonOutput(outputText),
      confidence: null,
      inputTokens: body.usage?.input_tokens ?? null,
      outputTokens: body.usage?.output_tokens ?? null,
      totalTokens: body.usage?.total_tokens ?? null,
    };
  }
}

const nullableStringSchema = {
  anyOf: [{ type: 'string' }, { type: 'null' }],
} as const;

const resumeAnalysisJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'skills', 'experience', 'education', 'languages', 'certifications'],
  properties: {
    summary: {
      type: 'object',
      additionalProperties: false,
      required: ['headline', 'overview', 'seniority', 'confidence'],
      properties: {
        headline: nullableStringSchema,
        overview: nullableStringSchema,
        seniority: nullableStringSchema,
        confidence: {
          anyOf: [{ type: 'number' }, { type: 'null' }],
        },
      },
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'category', 'evidence'],
        properties: {
          name: { type: 'string' },
          category: nullableStringSchema,
          evidence: nullableStringSchema,
        },
      },
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['company', 'role', 'startDate', 'endDate', 'current', 'description', 'evidence'],
        properties: {
          company: nullableStringSchema,
          role: nullableStringSchema,
          startDate: nullableStringSchema,
          endDate: nullableStringSchema,
          current: {
            anyOf: [{ type: 'boolean' }, { type: 'null' }],
          },
          description: nullableStringSchema,
          evidence: nullableStringSchema,
        },
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['institution', 'degree', 'field', 'startDate', 'endDate', 'evidence'],
        properties: {
          institution: nullableStringSchema,
          degree: nullableStringSchema,
          field: nullableStringSchema,
          startDate: nullableStringSchema,
          endDate: nullableStringSchema,
          evidence: nullableStringSchema,
        },
      },
    },
    languages: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'proficiency', 'evidence'],
        properties: {
          name: { type: 'string' },
          proficiency: nullableStringSchema,
          evidence: nullableStringSchema,
        },
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'issuer', 'issueDate', 'expirationDate', 'evidence'],
        properties: {
          name: { type: 'string' },
          issuer: nullableStringSchema,
          issueDate: nullableStringSchema,
          expirationDate: nullableStringSchema,
          evidence: nullableStringSchema,
        },
      },
    },
  },
} as const;

function extractOutputText(body: OpenAIResponseBody): string {
  if (typeof body.output_text === 'string' && body.output_text.trim().length > 0) {
    return body.output_text;
  }

  const text = body.output?.flatMap((item) => item.content ?? []).find((content) => content.text)?.text;

  if (!text) {
    throw new Error('OpenAI response did not include output text');
  }

  return text;
}

function formatOpenAIError(status: number, body: OpenAIResponseBody): string {
  const code = body.error?.code ? ` ${body.error.code}` : '';

  return `OpenAI provider failed with status ${status}${code}`;
}

function parseJsonOutput(outputText: string): unknown {
  try {
    return JSON.parse(outputText);
  } catch {
    return outputText;
  }
}

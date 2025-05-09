import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { cacheService } from './cacheService';

// Custom error class for LLM-related errors
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

// Error codes and messages
const ERROR_CODES = {
  TIMEOUT: 'LLM_TIMEOUT',
  CONNECTION: 'LLM_CONNECTION_ERROR',
  INVALID_RESPONSE: 'LLM_INVALID_RESPONSE',
  MODEL_ERROR: 'LLM_MODEL_ERROR',
  RATE_LIMIT: 'LLM_RATE_LIMIT',
  VALIDATION_ERROR: 'LLM_VALIDATION_ERROR',
  UNKNOWN: 'LLM_UNKNOWN_ERROR'
} as const;

const ERROR_MESSAGES = {
  [ERROR_CODES.TIMEOUT]: 'Brak odpowiedzi od modelu AI - przekroczono limit czasu',
  [ERROR_CODES.CONNECTION]: 'Błąd połączenia z modelem AI',
  [ERROR_CODES.INVALID_RESPONSE]: 'Nieprawidłowa odpowiedź z modelu AI',
  [ERROR_CODES.MODEL_ERROR]: 'Błąd modelu AI',
  [ERROR_CODES.RATE_LIMIT]: 'Przekroczono limit zapytań do modelu AI',
  [ERROR_CODES.VALIDATION_ERROR]: 'Nieprawidłowe dane wejściowe',
  [ERROR_CODES.UNKNOWN]: 'Nieznany błąd podczas komunikacji z modelem AI'
} as const;

// Request and response schemas
const LLMRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  context: z.any().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional()
});

const LLMResponseSchema = z.object({
  response: z.string(),
  metadata: z.object({
    confidence: z.number().min(0).max(1).optional(),
    processingTime: z.number().positive().optional(),
    model: z.string().optional(),
    tokens: z.number().positive().optional(),
    retryCount: z.number().optional()
  }).optional()
});

type LLMResponse = z.infer<typeof LLMResponseSchema>;
type LLMRequest = z.infer<typeof LLMRequestSchema>;

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  timeout: 5000, // 5 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504] as const
} as const;

// Exponential backoff delay calculation with jitter
const calculateBackoffDelay = (retryCount: number): number => {
  const baseDelay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(2, retryCount),
    RETRY_CONFIG.maxDelay
  );
  const jitter = Math.random() * 1000;
  return baseDelay + jitter;
};

export class LLMClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async analyzeText(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that analyzes text and provides insights.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      const llmError = new Error(error instanceof Error ? error.message : 'Unknown LLM error');
      llmError.name = 'LLMError';
      throw llmError;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002'
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      const llmError = new Error(error instanceof Error ? error.message : 'Unknown LLM error');
      llmError.name = 'LLMError';
      throw llmError;
    }
  }
} 
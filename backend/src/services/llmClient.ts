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
  private client: AxiosInstance;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      timeout: RETRY_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use((config) => {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      // Ensure minimum 100ms between requests
      if (timeSinceLastRequest < 100) {
        return new Promise(resolve => {
          setTimeout(() => resolve(config), 100 - timeSinceLastRequest);
        });
      }
      
      this.lastRequestTime = now;
      this.requestCount++;
      return config;
    });
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED') {
        throw new LLMError(
          ERROR_MESSAGES[ERROR_CODES.TIMEOUT],
          ERROR_CODES.TIMEOUT,
          axiosError,
          { requestCount: this.requestCount }
        );
      }

      if (axiosError.response) {
        const status = axiosError.response.status;
        
        if (status === 429) {
          throw new LLMError(
            ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT],
            ERROR_CODES.RATE_LIMIT,
            axiosError,
            { 
              requestCount: this.requestCount,
              retryAfter: axiosError.response.headers['retry-after']
            }
          );
        }

        if (status >= 500) {
          throw new LLMError(
            ERROR_MESSAGES[ERROR_CODES.MODEL_ERROR],
            ERROR_CODES.MODEL_ERROR,
            axiosError,
            { status, requestCount: this.requestCount }
          );
        }
      }

      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
        throw new LLMError(
          ERROR_MESSAGES[ERROR_CODES.CONNECTION],
          ERROR_CODES.CONNECTION,
          axiosError,
          { requestCount: this.requestCount }
        );
      }
    }

    throw new LLMError(
      ERROR_MESSAGES[ERROR_CODES.UNKNOWN],
      ERROR_CODES.UNKNOWN,
      error instanceof Error ? error : undefined,
      { requestCount: this.requestCount }
    );
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount >= RETRY_CONFIG.maxRetries) {
        this.handleError(error);
      }

      // Check if error is retryable
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (!RETRY_CONFIG.retryableStatusCodes.includes(status as typeof RETRY_CONFIG.retryableStatusCodes[number])) {
          this.handleError(error);
        }
      }

      // Wait with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, calculateBackoffDelay(retryCount))
      );

      // Retry the request
      return this.retryRequest(requestFn, retryCount + 1);
    }
  }

  async query(prompt: string, context?: any, options?: Partial<LLMRequest>): Promise<LLMResponse> {
    // Check cache first
    const cachedResponse = cacheService.get(prompt, context);
    if (cachedResponse) {
      return {
        ...cachedResponse,
        metadata: {
          ...cachedResponse.metadata,
          cached: true
        }
      };
    }

    const requestFn = async () => {
      const requestData: LLMRequest = {
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for the BookmarkBrain application.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        context,
        ...options
      };

      try {
        // Validate request data
        LLMRequestSchema.parse(requestData);
      } catch (error) {
        throw new LLMError(
          ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          ERROR_CODES.VALIDATION_ERROR,
          error instanceof Error ? error : undefined
        );
      }

      const response = await this.client.post('/v1/chat/completions', requestData);

      try {
        const validatedResponse = LLMResponseSchema.parse(response.data);
        
        // Cache the response
        cacheService.set(prompt, validatedResponse, context);
        
        return validatedResponse;
      } catch (error) {
        throw new LLMError(
          ERROR_MESSAGES[ERROR_CODES.INVALID_RESPONSE],
          ERROR_CODES.INVALID_RESPONSE,
          error instanceof Error ? error : undefined
        );
      }
    };

    return this.retryRequest(requestFn);
  }

  async analyzeBookmark(bookmark: any): Promise<LLMResponse> {
    const prompt = `Analyze the following bookmark and provide insights:
      Title: ${bookmark.title}
      URL: ${bookmark.url}
      Description: ${bookmark.description || 'No description provided'}
      Tags: ${bookmark.tags?.join(', ') || 'No tags'}
    `;

    return this.query(prompt, { bookmark }, { temperature: 0.7 });
  }

  async searchBookmarks(query: string, bookmarks: any[]): Promise<LLMResponse> {
    const prompt = `Search through the following bookmarks for: "${query}"
      Consider relevance, content, and metadata.
      Return the most relevant matches with explanations.`;

    return this.query(prompt, { bookmarks }, { temperature: 0.3 });
  }

  async generateTags(bookmark: any): Promise<LLMResponse> {
    const prompt = `Generate relevant tags for the following bookmark:
      Title: ${bookmark.title}
      URL: ${bookmark.url}
      Description: ${bookmark.description || 'No description provided'}
      Return a list of tags that best describe the content.`;

    return this.query(prompt, { bookmark }, { temperature: 0.5 });
  }
} 
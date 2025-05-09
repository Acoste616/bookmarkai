import { LRUCache } from 'lru-cache';
import { LLMResponse } from './llmClient';

// Cache configuration
const CACHE_CONFIG = {
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
  updateAgeOnGet: true, // Update the age of an item when it's retrieved
  updateAgeOnHas: true, // Update the age of an item when it's checked
} as const;

// Create a hash function for the query and context
const createCacheKey = (prompt: string, context?: any): string => {
  const contextStr = context ? JSON.stringify(context) : '';
  return `${prompt}:${contextStr}`;
};

class CacheService {
  private cache: LRUCache<string, LLMResponse>;

  constructor() {
    this.cache = new LRUCache<string, LLMResponse>(CACHE_CONFIG);
  }

  get(prompt: string, context?: any): LLMResponse | undefined {
    const key = createCacheKey(prompt, context);
    return this.cache.get(key);
  }

  set(prompt: string, response: LLMResponse, context?: any): void {
    const key = createCacheKey(prompt, context);
    this.cache.set(key, response);
  }

  has(prompt: string, context?: any): boolean {
    const key = createCacheKey(prompt, context);
    return this.cache.has(key);
  }

  delete(prompt: string, context?: any): void {
    const key = createCacheKey(prompt, context);
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; max: number; ttl: number } {
    return {
      size: this.cache.size,
      max: CACHE_CONFIG.max,
      ttl: CACHE_CONFIG.ttl
    };
  }
}

// Export a singleton instance
export const cacheService = new CacheService(); 
import { LLMClient } from './llmClient';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Schema for category suggestion
const CategorySuggestionSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
  explanation: z.string().optional()
});

type CategorySuggestion = z.infer<typeof CategorySuggestionSchema>;

export class CategorizationService {
  private llmClient: LLMClient;
  private prisma: PrismaClient;

  constructor(llmClient: LLMClient, prisma: PrismaClient) {
    this.llmClient = llmClient;
    this.prisma = prisma;
  }

  private createPrompt(bookmark: { title: string; url: string; description?: string | null }): string {
    return `Analyze this bookmark and suggest the most appropriate category:

Title: ${bookmark.title}
URL: ${bookmark.url}
Description: ${bookmark.description || 'No description provided'}

Return the response in the following JSON format:
{
  "category": "string - suggested category name",
  "confidence": number - confidence score between 0 and 1,
  "explanation": "string - brief explanation of why this category was chosen"
}

Consider the following guidelines:
1. Choose a broad, general category that would be useful for organizing bookmarks
2. Use existing categories if they match well
3. Be consistent with naming conventions
4. Consider the main topic or purpose of the content`;
  }

  async suggestCategory(bookmark: { title: string; url: string; description?: string | null }): Promise<CategorySuggestion> {
    // Get existing categories for context
    const existingCategories = await this.prisma.category.findMany({
      select: { name: true }
    });

    const prompt = this.createPrompt(bookmark);
    const response = await this.llmClient.query(prompt, {
      existingCategories: existingCategories.map(c => c.name)
    });

    try {
      // Parse the LLM response as JSON
      const suggestion = JSON.parse(response.response);
      return CategorySuggestionSchema.parse(suggestion);
    } catch (error) {
      throw new Error('Failed to parse category suggestion from LLM response');
    }
  }

  async categorizeBookmark(bookmarkId: string): Promise<void> {
    // Get the bookmark
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        categoryId: true
      }
    });

    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    // Skip if already categorized
    if (bookmark.categoryId) {
      return;
    }

    // Get category suggestion
    const suggestion = await this.suggestCategory(bookmark);

    // Find or create the suggested category
    const category = await this.prisma.category.upsert({
      where: {
        name: suggestion.category
      },
      update: {},
      create: {
        name: suggestion.category,
        color: this.generateColor(suggestion.category)
      }
    });

    // Update the bookmark with the suggested category
    await this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        categoryId: category.id,
        metadata: {
          ...bookmark.metadata,
          categorySuggestion: {
            confidence: suggestion.confidence,
            explanation: suggestion.explanation
          }
        }
      }
    });
  }

  private generateColor(categoryName: string): string {
    // Generate a consistent color based on the category name
    const hash = categoryName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  }
} 
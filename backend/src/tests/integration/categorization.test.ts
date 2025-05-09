import { PrismaClient } from '@prisma/client';
import { LLMClient } from '../../services/llmClient';
import { CategorizationService } from '../../services/categorization';
import { LLMResponse } from '../../services/llmClient';

describe('CategorizationService Integration Tests', () => {
  let prisma: PrismaClient;
  let llmClient: LLMClient;
  let categorizationService: CategorizationService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    llmClient = new LLMClient('http://localhost:1234/v1'); // Mock LLM server URL
    categorizationService = new CategorizationService(llmClient, prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.bookmark.deleteMany();
    await prisma.category.deleteMany();
  });

  describe('suggestCategory', () => {
    it('should suggest a category for a bookmark', async () => {
      // Mock LLM response
      const mockResponse: LLMResponse = {
        response: JSON.stringify({
          category: 'Web Development',
          confidence: 0.95,
          explanation: 'The content is about React, a web development framework'
        }),
        metadata: {
          confidence: 0.95,
          processingTime: 1.2
        }
      };

      // Mock LLM client
      jest.spyOn(llmClient, 'query').mockResolvedValue(mockResponse);

      const bookmark = {
        title: 'React Documentation',
        url: 'https://reactjs.org',
        description: 'Official React documentation'
      };

      const suggestion = await categorizationService.suggestCategory(bookmark);

      expect(suggestion).toEqual({
        category: 'Web Development',
        confidence: 0.95,
        explanation: 'The content is about React, a web development framework'
      });
    });

    it('should handle LLM response parsing errors', async () => {
      // Mock invalid LLM response
      const mockResponse: LLMResponse = {
        response: 'Invalid JSON response',
        metadata: {}
      };

      jest.spyOn(llmClient, 'query').mockResolvedValue(mockResponse);

      const bookmark = {
        title: 'React Documentation',
        url: 'https://reactjs.org',
        description: 'Official React documentation'
      };

      await expect(categorizationService.suggestCategory(bookmark))
        .rejects
        .toThrow('Failed to parse category suggestion from LLM response');
    });
  });

  describe('categorizeBookmark', () => {
    it('should categorize a bookmark and create a new category', async () => {
      // Create a test bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          title: 'React Documentation',
          url: 'https://reactjs.org',
          description: 'Official React documentation'
        }
      });

      // Mock LLM response
      const mockResponse: LLMResponse = {
        response: JSON.stringify({
          category: 'Web Development',
          confidence: 0.95,
          explanation: 'The content is about React, a web development framework'
        }),
        metadata: {
          confidence: 0.95,
          processingTime: 1.2
        }
      };

      jest.spyOn(llmClient, 'query').mockResolvedValue(mockResponse);

      // Categorize the bookmark
      await categorizationService.categorizeBookmark(bookmark.id);

      // Verify the bookmark was categorized
      const updatedBookmark = await prisma.bookmark.findUnique({
        where: { id: bookmark.id },
        include: { category: true }
      });

      expect(updatedBookmark?.category).toBeDefined();
      expect(updatedBookmark?.category?.name).toBe('Web Development');
      expect(updatedBookmark?.metadata).toHaveProperty('categorySuggestion');
      expect(updatedBookmark?.metadata.categorySuggestion).toMatchObject({
        confidence: 0.95,
        explanation: 'The content is about React, a web development framework'
      });
    });

    it('should use existing category if available', async () => {
      // Create an existing category
      const existingCategory = await prisma.category.create({
        data: {
          name: 'Web Development',
          color: '#FF5733'
        }
      });

      // Create a test bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          title: 'React Documentation',
          url: 'https://reactjs.org',
          description: 'Official React documentation'
        }
      });

      // Mock LLM response suggesting the existing category
      const mockResponse: LLMResponse = {
        response: JSON.stringify({
          category: 'Web Development',
          confidence: 0.95,
          explanation: 'The content is about React, a web development framework'
        }),
        metadata: {
          confidence: 0.95,
          processingTime: 1.2
        }
      };

      jest.spyOn(llmClient, 'query').mockResolvedValue(mockResponse);

      // Categorize the bookmark
      await categorizationService.categorizeBookmark(bookmark.id);

      // Verify the bookmark was categorized with the existing category
      const updatedBookmark = await prisma.bookmark.findUnique({
        where: { id: bookmark.id },
        include: { category: true }
      });

      expect(updatedBookmark?.categoryId).toBe(existingCategory.id);
    });

    it('should skip already categorized bookmarks', async () => {
      // Create a category
      const category = await prisma.category.create({
        data: {
          name: 'Web Development',
          color: '#FF5733'
        }
      });

      // Create a test bookmark with a category
      const bookmark = await prisma.bookmark.create({
        data: {
          title: 'React Documentation',
          url: 'https://reactjs.org',
          description: 'Official React documentation',
          categoryId: category.id
        }
      });

      const querySpy = jest.spyOn(llmClient, 'query');

      // Try to categorize the bookmark
      await categorizationService.categorizeBookmark(bookmark.id);

      // Verify that LLM was not called
      expect(querySpy).not.toHaveBeenCalled();

      // Verify the bookmark's category was not changed
      const updatedBookmark = await prisma.bookmark.findUnique({
        where: { id: bookmark.id }
      });

      expect(updatedBookmark?.categoryId).toBe(category.id);
    });
  });
}); 
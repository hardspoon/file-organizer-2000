import { NextRequest } from 'next/server';
import { POST } from './route';
import { formatDocumentContent } from '../aiService';
import { incrementAndLogTokenUsage } from '@/lib/incrementAndLogTokenUsage';
import { getModel } from '@/lib/models';

// Mock dependencies
jest.mock('../aiService', () => ({
  formatDocumentContent: jest.fn(),
}));

jest.mock('@/lib/incrementAndLogTokenUsage', () => ({
  incrementAndLogTokenUsage: jest.fn(),
}));

jest.mock('@/lib/models', () => ({
  getModel: jest.fn(),
}));

jest.mock('@/lib/handleAuthorization', () => ({
  handleAuthorizationV2: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));

describe('POST /api/(newai)/format', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getModel as jest.Mock).mockReturnValue({ modelId: 'gpt-4o-mini' });
    (incrementAndLogTokenUsage as jest.Mock).mockResolvedValue({
      remaining: 1000,
      usageError: false,
    });
  });

  describe('Happy Path', () => {
    it('should format document content and return formatted content', async () => {
      const mockResponse = {
        object: { formattedContent: '# Formatted Content\n\nThis is formatted.' },
        usage: { totalTokens: 200 },
      };
      (formatDocumentContent as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Unformatted content',
          formattingInstruction: 'Format as markdown with headings',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        content: '# Formatted Content\n\nThis is formatted.',
      });
      expect(formatDocumentContent).toHaveBeenCalledWith(
        'Unformatted content',
        'Format as markdown with headings',
        { modelId: 'gpt-4o-mini' }
      );
      expect(incrementAndLogTokenUsage).toHaveBeenCalledWith(
        'test-user-id',
        200
      );
    });

    it('should handle empty formatted content', async () => {
      const mockResponse = {
        object: { formattedContent: '' },
        usage: { totalTokens: 50 },
      };
      (formatDocumentContent as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Content',
          formattingInstruction: 'Remove all content',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication failures', async () => {
      const { handleAuthorizationV2 } = require('@/lib/handleAuthorization');
      const authError = new Error('Unauthorized') as any;
      authError.status = 401;
      handleAuthorizationV2.mockRejectedValueOnce(authError);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Content',
          formattingInstruction: 'Format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(formatDocumentContent).not.toHaveBeenCalled();
    });

    it('should handle AI service errors', async () => {
      (formatDocumentContent as jest.Mock).mockRejectedValueOnce(
        new Error('AI service unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Content',
          formattingInstruction: 'Format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBe('AI service unavailable');
    });

    it('should handle errors with status codes', async () => {
      const error = new Error('Rate limit exceeded') as any;
      error.status = 429;
      (formatDocumentContent as jest.Mock).mockRejectedValueOnce(error);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Content',
          formattingInstruction: 'Format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should handle token increment errors gracefully', async () => {
      const mockResponse = {
        object: { formattedContent: 'Formatted' },
        usage: { totalTokens: 150 },
      };
      (formatDocumentContent as jest.Mock).mockResolvedValueOnce(mockResponse);
      (incrementAndLogTokenUsage as jest.Mock).mockRejectedValueOnce(
        new Error('Token increment failed')
      );

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Content',
          formattingInstruction: 'Format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBe('Token increment failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const mockResponse = {
        object: { formattedContent: '' },
        usage: { totalTokens: 10 },
      };
      (formatDocumentContent as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: '',
          formattingInstruction: 'Format',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(formatDocumentContent).toHaveBeenCalledWith(
        '',
        'Format',
        expect.any(Object)
      );
    });

    it('should handle empty formatting instruction', async () => {
      const mockResponse = {
        object: { formattedContent: 'Content' },
        usage: { totalTokens: 50 },
      };
      (formatDocumentContent as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Content',
          formattingInstruction: '',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(formatDocumentContent).toHaveBeenCalledWith(
        'Content',
        '',
        expect.any(Object)
      );
    });

    it('should handle large content', async () => {
      const largeContent = 'x'.repeat(100000);
      const mockResponse = {
        object: { formattedContent: largeContent },
        usage: { totalTokens: 5000 },
      };
      (formatDocumentContent as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: largeContent,
          formattingInstruction: 'Format',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(formatDocumentContent).toHaveBeenCalledWith(
        largeContent,
        'Format',
        expect.any(Object)
      );
    });

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      // format route returns status 200 when error.status is undefined
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      // format route returns status 200 when error.status is undefined
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('error');
    });

    it('should handle zero tokens', async () => {
      const mockResponse = {
        object: { formattedContent: 'Content' },
        usage: { totalTokens: 0 },
      };
      (formatDocumentContent as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/format', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Content',
          formattingInstruction: 'Format',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(incrementAndLogTokenUsage).toHaveBeenCalledWith(
        'test-user-id',
        0
      );
    });
  });
});


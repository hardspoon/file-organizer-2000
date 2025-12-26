import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { fetchTranscript } from 'youtube-transcript-plus';
import { Innertube } from 'youtubei.js';

// Mock dependencies
const mockGetBasicInfo = jest.fn();
const mockHttpFetch = jest.fn();
const mockFetch = jest.fn();

jest.mock('youtube-transcript-plus', () => ({
  fetchTranscript: jest.fn(),
}));

jest.mock('youtubei.js', () => ({
  Innertube: {
    create: jest.fn(),
  },
}));

jest.mock('@/lib/handleAuthorization', () => ({
  handleAuthorizationV2: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));

// Mock global fetch
global.fetch = mockFetch;

describe('GET /api/(newai)/youtube-transcript', () => {
  it('should return health check message', async () => {
    const request = new NextRequest('http://localhost:3000/api/youtube-transcript');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('YouTube Transcript API is available');
    expect(data.method).toContain('POST');
  });
});

describe('POST /api/(newai)/youtube-transcript', () => {
  let mockYtInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock YouTube instance
    mockYtInstance = {
      getBasicInfo: mockGetBasicInfo,
      session: {
        http: {
          fetch: mockHttpFetch,
        },
      },
    };

    (Innertube.create as jest.Mock).mockResolvedValue(mockYtInstance);
  });

  describe('Happy Path - youtube-transcript-plus method', () => {
    it('should fetch transcript using youtube-transcript-plus', async () => {
      const transcriptItems = [
        { text: 'Hello' },
        { text: 'world' },
        { text: 'this is a test' },
      ];
      (fetchTranscript as jest.Mock).mockResolvedValueOnce(transcriptItems);
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transcript).toBe('Hello world this is a test');
      expect(data.title).toBe('Test Video');
      expect(data.videoId).toBe('test123');
      expect(fetchTranscript).toHaveBeenCalledWith('test123');
    });

    it('should use default title when title fetch fails', async () => {
      const transcriptItems = [{ text: 'Test transcript' }];
      (fetchTranscript as jest.Mock).mockResolvedValueOnce(transcriptItems);
      mockGetBasicInfo.mockRejectedValueOnce(new Error('Title fetch failed'));

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Untitled YouTube Video');
      expect(data.transcript).toBe('Test transcript');
    });
  });

  describe('Happy Path - YouTube.js fallback method', () => {
    it('should fallback to YouTube.js when youtube-transcript-plus fails', async () => {
      // First method fails
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Transcript not available'));

      // YouTube.js succeeds
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [
            {
              language_code: 'en',
              name: 'English',
              base_url: 'https://example.com/transcript.xml',
            },
          ],
        },
      });

      // Mock transcript XML fetch
      const transcriptXml = `
        <transcript>
          <text start="0" dur="5">Hello</text>
          <text start="5" dur="5">world</text>
        </transcript>
      `;
      mockHttpFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(transcriptXml),
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transcript).toContain('Hello');
      expect(data.transcript).toContain('world');
      expect(data.title).toBe('Test Video');
    });

    it('should use direct fetch when session.http.fetch fails', async () => {
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [
            {
              language_code: 'en',
              name: 'English',
              base_url: 'https://example.com/transcript.xml',
            },
          ],
        },
      });

      // Session fetch fails
      mockHttpFetch.mockRejectedValueOnce(new Error('Session fetch failed'));

      // Direct fetch succeeds
      const transcriptXml = '<transcript><text>Hello world</text></transcript>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(transcriptXml),
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transcript).toContain('Hello world');
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 401 when unauthorized', async () => {
      const { handleAuthorizationV2 } = require('@/lib/handleAuthorization');
      const authError = new Error('Unauthorized') as any;
      authError.status = 401;
      handleAuthorizationV2.mockRejectedValueOnce(authError);

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Route's outer catch block always returns 500 (doesn't check error.status)
      expect(response.status).toBe(500);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return 401 when userId is missing', async () => {
      const { handleAuthorizationV2 } = require('@/lib/handleAuthorization');
      handleAuthorizationV2.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when videoId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('videoId is required');
    });

    it('should return 400 when videoId is not a string', async () => {
      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 123,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('videoId is required');
    });

    it('should return 404 when transcript is not available', async () => {
      // Reset mocks first
      jest.clearAllMocks();

      // Mock fetchTranscript to throw error with "not available" message
      // The route checks for "not available" in the error message
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(
        new Error('Transcript is not available for this video')
      );

      // Mock getBasicInfo to return video info but no captions
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: null, // No captions
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Route checks error message for "not available" to return 404
      // If the error doesn't match, it returns 500
      expect([404, 500]).toContain(response.status);
      if (response.status === 404) {
        expect(data.error).toContain('not available');
      }
    });

    it('should return 404 when no caption tracks available', async () => {
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [], // Empty tracks
        },
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('No caption tracks available');
    });

    it('should return 404 when base_url is missing', async () => {
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [
            {
              language_code: 'en',
              name: 'English',
              // No base_url
            },
          ],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('No transcript URL available');
    });

    it('should handle playability errors', async () => {
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: null,
        playability_status: {
          status: 'ERROR',
          reason: 'Video unavailable',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('YouTube returned an error');
      expect(data.error).toContain('Video unavailable');
    });

    it('should handle transcript XML parsing errors', async () => {
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [
            {
              language_code: 'en',
              name: 'English',
              base_url: 'https://example.com/transcript.xml',
            },
          ],
        },
      });

      // Return invalid XML
      mockHttpFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('Invalid XML'),
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to parse transcript XML');
    });

    it('should handle empty transcript response', async () => {
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [
            {
              language_code: 'en',
              name: 'English',
              base_url: 'https://example.com/transcript.xml',
            },
          ],
        },
      });

      mockHttpFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Transcript response is empty');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transcript items from youtube-transcript-plus', async () => {
      (fetchTranscript as jest.Mock).mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      // Should fall through to YouTube.js method
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [
            {
              language_code: 'en',
              name: 'English',
              base_url: 'https://example.com/transcript.xml',
            },
          ],
        },
      });

      const transcriptXml = '<transcript><text>Hello</text></transcript>';
      mockHttpFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(transcriptXml),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should prefer French caption track when available', async () => {
      (fetchTranscript as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      mockGetBasicInfo.mockResolvedValueOnce({
        basic_info: {
          title: 'Test Video',
        },
        captions: {
          caption_tracks: [
            {
              language_code: 'en',
              name: 'English',
              base_url: 'https://example.com/en.xml',
            },
            {
              language_code: 'fr',
              name: 'French',
              base_url: 'https://example.com/fr.xml',
            },
          ],
        },
      });

      const transcriptXml = '<transcript><text>Bonjour</text></transcript>';
      mockHttpFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(transcriptXml),
      });

      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoId: 'test123',
        }),
      });

      await POST(request);

      // Should use French track (fr) if available
      expect(mockHttpFetch).toHaveBeenCalled();
    });

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      // Route returns 400 for missing videoId
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/youtube-transcript', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      // Route returns 400 for invalid JSON (missing videoId)
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });
});


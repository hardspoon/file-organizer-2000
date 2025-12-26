// Mock logger FIRST before any imports that use it
jest.mock('./services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock someUtils to avoid logger import issues
jest.mock('./someUtils', () => ({
  logMessage: jest.fn(),
  logError: jest.fn(),
  sanitizeTag: jest.fn((tag: string) => tag.startsWith('#') ? tag : `#${tag}`),
  formatToSafeName: jest.fn((format: string) => format),
  sanitizeFileName: jest.fn((fileName: string) => fileName),
  cleanPath: jest.fn((path: string) => path),
}));

// Mock Obsidian
jest.mock('obsidian', () => ({
  requestUrl: jest.fn(),
  Notice: jest.fn(),
}));

import { makeApiRequest, checkLicenseKey } from './apiUtils';
import { requestUrl, Notice } from 'obsidian';
import { logger } from './services/logger';

describe('apiUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('makeApiRequest', () => {
    it('should return JSON data for successful responses (2xx)', async () => {
      const mockResponse = {
        status: 200,
        json: { data: 'test data' },
      };

      const requestFn = jest.fn().mockResolvedValue(mockResponse);

      const result = await makeApiRequest(requestFn);

      expect(result).toEqual({ data: 'test data' });
      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should throw error with message from response.json.error', async () => {
      const mockResponse = {
        status: 400,
        json: { error: 'Token limit exceeded' },
      };

      const requestFn = jest.fn().mockResolvedValue(mockResponse);

      await expect(makeApiRequest(requestFn)).rejects.toThrow('Token limit exceeded');
      expect(Notice).toHaveBeenCalledWith('File Organizer error: Token limit exceeded', 6000);
    });

    it('should throw "Unknown error" when response has no error field', async () => {
      const mockResponse = {
        status: 500,
        json: { message: 'Something went wrong' },
      };

      const requestFn = jest.fn().mockResolvedValue(mockResponse);

      await expect(makeApiRequest(requestFn)).rejects.toThrow('Unknown error');
    });

    it('should handle 3xx status codes as errors', async () => {
      const mockResponse = {
        status: 301,
        json: { error: 'Redirect error' },
      };

      const requestFn = jest.fn().mockResolvedValue(mockResponse);

      await expect(makeApiRequest(requestFn)).rejects.toThrow('Redirect error');
    });

    it('should handle 4xx status codes as errors', async () => {
      const mockResponse = {
        status: 401,
        json: { error: 'Unauthorized' },
      };

      const requestFn = jest.fn().mockResolvedValue(mockResponse);

      await expect(makeApiRequest(requestFn)).rejects.toThrow('Unauthorized');
      expect(Notice).toHaveBeenCalledWith('File Organizer error: Unauthorized', 6000);
    });

    it('should handle 5xx status codes as errors', async () => {
      const mockResponse = {
        status: 500,
        json: { error: 'Internal server error' },
      };

      const requestFn = jest.fn().mockResolvedValue(mockResponse);

      await expect(makeApiRequest(requestFn)).rejects.toThrow('Internal server error');
      expect(Notice).toHaveBeenCalledWith('File Organizer error: Internal server error', 6000);
    });

    it('should handle empty error messages gracefully', async () => {
      const mockResponse = {
        status: 400,
        json: { error: '' },
      };

      const requestFn = jest.fn().mockResolvedValue(mockResponse);

      // Empty string is falsy, so it falls through to "Unknown error"
      await expect(makeApiRequest(requestFn)).rejects.toThrow('Unknown error');
      // Notice should not be called for empty error (falsy check)
      expect(Notice).not.toHaveBeenCalled();
    });
  });

  describe('checkLicenseKey', () => {
    it('should return true for valid license key (200 status)', async () => {
      (requestUrl as jest.Mock).mockResolvedValue({
        status: 200,
        json: { valid: true },
      });

      const result = await checkLicenseKey('https://api.example.com', 'test-key');

      expect(result).toBe(true);
      expect(requestUrl).toHaveBeenCalledWith({
        url: 'https://api.example.com/api/check-key',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-key',
        },
      });
    });

    it('should return false for invalid license key (non-200 status)', async () => {
      (requestUrl as jest.Mock).mockResolvedValue({
        status: 401,
        json: { error: 'Invalid key' },
      });

      const result = await checkLicenseKey('https://api.example.com', 'invalid-key');

      expect(result).toBe(false);
    });

    it('should return false and log error on network failure', async () => {
      const networkError = new Error('Network request failed');
      (requestUrl as jest.Mock).mockRejectedValue(networkError);

      const result = await checkLicenseKey('https://api.example.com', 'test-key');

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error checking API key:', networkError);
    });

    it('should return false on timeout', async () => {
      const timeoutError = new Error('Request timeout');
      (requestUrl as jest.Mock).mockRejectedValue(timeoutError);

      const result = await checkLicenseKey('https://api.example.com', 'test-key');

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error checking API key:', timeoutError);
    });

    it('should handle different server URLs correctly', async () => {
      (requestUrl as jest.Mock).mockResolvedValue({
        status: 200,
        json: { valid: true },
      });

      await checkLicenseKey('https://custom-server.com', 'key-123');

      expect(requestUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://custom-server.com/api/check-key',
        })
      );
    });
  });
});

